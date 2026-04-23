import * as THREE from 'three';

export default class Particles {
  constructor(scene, camera) {
    this.scene  = scene;
    this.camera = camera;

    this.mouse2D = new THREE.Vector2(9999, 9999);
    this.mouse3D = new THREE.Vector3();
    this._ray    = new THREE.Vector3();

    const COUNT = 4200;
    this.count  = COUNT;

    this.positions  = new Float32Array(COUNT * 3);
    this.origins    = new Float32Array(COUNT * 3);
    this.velocities = new Float32Array(COUNT * 3);
    this.sizes      = new Float32Array(COUNT);
    this.colors     = new Float32Array(COUNT * 3);

    // Color palette — blues only
    const palette = [
      [0.0,  0.83, 1.0],   // #00d4ff bright cyan-blue
      [0.0,  0.60, 0.80],  // #0099cc mid blue
      [0.27, 0.53, 1.0],   // #4488ff electric blue
      [0.13, 0.33, 0.80],  // #2255cc deep blue
      [0.0,  0.71, 0.85],  // #00b4d8 sky blue
      [0.33, 0.67, 1.0],   // #55aaff soft blue
      [0.10, 0.24, 1.0],   // #1a3dff vivid blue
    ];

    for (let i = 0; i < COUNT; i++) {
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 50;

      this.positions[i * 3]     = x;
      this.positions[i * 3 + 1] = y;
      this.positions[i * 3 + 2] = z;
      this.origins[i * 3]       = x;
      this.origins[i * 3 + 1]   = y;
      this.origins[i * 3 + 2]   = z;

      // Mix of tiny and small — layered depth feel
      this.sizes[i] = 0.9 + Math.random() * 3.2;

      // Random color from palette with slight variation
      const col = palette[Math.floor(Math.random() * palette.length)];
      this.colors[i * 3]     = col[0] + (Math.random() - 0.5) * 0.1;
      this.colors[i * 3 + 1] = col[1] + (Math.random() - 0.5) * 0.1;
      this.colors[i * 3 + 2] = col[2] + (Math.random() - 0.5) * 0.1;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(this.sizes,     1));
    geo.setAttribute('aColor',   new THREE.BufferAttribute(this.colors,    3));

    const mat = new THREE.ShaderMaterial({
      vertexShader: /* glsl */`
        attribute float aSize;
        attribute vec3  aColor;
        varying   vec3  vColor;
        varying   float vAlpha;

        void main() {
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = max(1.0, aSize * (120.0 / -mvPos.z));
          // Fade with depth
          vAlpha = 1.0 - smoothstep(14.0, 35.0, -mvPos.z);
          vColor = aColor;
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: /* glsl */`
        varying vec3  vColor;
        varying float vAlpha;

        void main() {
          vec2  uv   = gl_PointCoord - 0.5;
          float dist = length(uv);
          if (dist > 0.5) discard;

          // Soft disc — visible but not blown out
          float falloff = pow(1.0 - dist * 2.0, 1.8);
          // Tiny bright center pinpoint
          float core  = 1.0 - smoothstep(0.0, 0.12, dist);
          vec3  col   = mix(vColor, vColor + 0.25, core);
          float alpha = falloff * vAlpha * 0.52 + core * vAlpha * 0.18;
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geo, mat);
    this.scene.add(this.points);

    // Track mouse in NDC space
    window.addEventListener('mousemove', e => {
      this.mouse2D.x =  (e.clientX / window.innerWidth)  * 2 - 1;
      this.mouse2D.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
  }

  // Unproject mouse to approximate world Z=0 plane
  _unprojectMouse() {
    const cam = this.camera;
    // Near-plane point in NDC
    this.mouse3D.set(this.mouse2D.x, this.mouse2D.y, 0.5);
    this.mouse3D.unproject(cam);

    this._ray.copy(this.mouse3D).sub(cam.position).normalize();
    const denom = this._ray.z;
    if (Math.abs(denom) < 1e-6) return null;

    const t  = -cam.position.z / denom;
    return {
      x: cam.position.x + this._ray.x * t,
      y: cam.position.y + this._ray.y * t,
    };
  }

  update(scrollProgress = 0) {
    const mouse = this._unprojectMouse();
    const mx = mouse ? mouse.x : 99999;
    const my = mouse ? mouse.y : 99999;

    // Portal vortex — portal world position matches Portal.js (0, 0, 10)
    // Active during GENESIS, fades as camera passes through
    const PORTAL_X = 0, PORTAL_Y = 0, PORTAL_Z = 10;
    const vortexStr = Math.max(0, (0.13 - scrollProgress) / 0.13) * 0.90;

    const INFLUENCE = 5.5;
    const REPEL     = 0.12;
    const SPRING    = 0.028;
    const DAMPING   = 0.82;

    const pos = this.positions;
    const ori = this.origins;
    const vel = this.velocities;

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      const px = pos[i3], py = pos[i3 + 1], pz = pos[i3 + 2];
      const ox = ori[i3], oy = ori[i3 + 1], oz = ori[i3 + 2];

      // ── Portal vortex ──────────────────────────────────────────
      if (vortexStr > 0) {
        const vdx  = PORTAL_X - px;
        const vdy  = PORTAL_Y - py;
        const vdz  = PORTAL_Z - pz;
        const vd2  = vdx * vdx + vdy * vdy + vdz * vdz;
        const vdist = Math.sqrt(vd2);

        if (vdist > 0.5) {
          // Radial pull — stronger from far away
          const pull = vortexStr * 0.007 / (vdist * 0.25 + 1);
          vel[i3]     += (vdx / vdist) * pull;
          vel[i3 + 1] += (vdy / vdist) * pull;
          vel[i3 + 2] += (vdz / vdist) * pull;

          // Tangential swirl around Z axis
          const nx   = -vdy / vdist;
          const ny   =  vdx / vdist;
          vel[i3]     += nx * vortexStr * 0.005;
          vel[i3 + 1] += ny * vortexStr * 0.005;
        } else {
          // Particle reached portal — snap back to origin
          pos[i3]     = ox + (Math.random() - 0.5) * 4;
          pos[i3 + 1] = oy + (Math.random() - 0.5) * 4;
          pos[i3 + 2] = oz + (Math.random() - 0.5) * 4;
          vel[i3] = 0; vel[i3 + 1] = 0; vel[i3 + 2] = 0;
        }
      }

      // ── Mouse repulsion ────────────────────────────────────────
      const dx = px - mx;
      const dy = py - my;
      const d2 = dx * dx + dy * dy;
      if (d2 < INFLUENCE * INFLUENCE && d2 > 0.001) {
        const dist  = Math.sqrt(d2);
        const force = (INFLUENCE - dist) / INFLUENCE;
        vel[i3]     += (dx / dist) * force * REPEL;
        vel[i3 + 1] += (dy / dist) * force * REPEL;
      }

      // ── Spring back to origin ──────────────────────────────────
      vel[i3]     += (ox - px) * SPRING;
      vel[i3 + 1] += (oy - py) * SPRING;
      vel[i3 + 2] += (oz - pz) * SPRING * 0.35;

      // Damping
      vel[i3]     *= DAMPING;
      vel[i3 + 1] *= DAMPING;
      vel[i3 + 2] *= DAMPING;

      // Integrate
      pos[i3]     += vel[i3];
      pos[i3 + 1] += vel[i3 + 1];
      pos[i3 + 2] += vel[i3 + 2];
    }

    this.points.geometry.attributes.position.needsUpdate = true;

    // Slow ambient drift
    this.points.rotation.y += 0.00018;
    this.points.rotation.x += 0.00007;
  }
}
