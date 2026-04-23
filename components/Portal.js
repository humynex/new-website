import * as THREE from 'three';

/* ── shared GLSL noise ──────────────────────────────────────────── */
const NOISE_GLSL = /* glsl */`
  float _h2(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float vnoise(vec2 p){
    vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(_h2(i),_h2(i+vec2(1,0)),f.x),
               mix(_h2(i+vec2(0,1)),_h2(i+vec2(1,1)),f.x),f.y);
  }
  float fbm2(vec2 p){
    float v=0.0,a=0.5;
    for(int i=0;i<4;i++){v+=a*vnoise(p);p=p*2.1+vec2(31.2,17.8);a*=0.48;}
    return v;
  }
`;

export default class EnergyPortal {
  constructor(scene) {
    this.scene        = scene;
    this.group        = new THREE.Group();
    this.group.position.set(0, 0, 10);
    this.openProgress = 0;

    this._buildGalaxyDisc();
    this._buildArmParticles();
    this._buildStarField();
    this._buildCore();

    scene.add(this.group);
  }

  get worldZ() { return this.group.position.z; }

  /* ── GALAXY DISC ─────────────────────────────────────────────── */
  _buildGalaxyDisc() {
    this.discUni = {
      uTime:     { value: 0 },
      uOpen:     { value: 0 },
      uApproach: { value: 0 },
    };

    const mat = new THREE.ShaderMaterial({
      uniforms: this.discUni,
      vertexShader: /* glsl */`
        varying vec2 vUv;
        void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }
      `,
      fragmentShader: /* glsl */`
        precision highp float;
        uniform float uTime, uOpen, uApproach;
        varying vec2 vUv;
        #define PI 3.14159265358979
        ${NOISE_GLSL}

        void main(){
          vec2 uv = vUv - 0.5;

          // Slightly squash on X — galaxies are oblate
          vec2 suv = vec2(uv.x * 0.82, uv.y);
          float dist = length(suv);

          // Slow galactic rotation
          float rot  = uTime * 0.055;
          float ca=cos(rot), sa=sin(rot);
          vec2 ruv   = vec2(suv.x*ca - suv.y*sa, suv.x*sa + suv.y*ca);
          float rdist = length(ruv);
          float rang  = atan(ruv.y, ruv.x);

          // Irregular, lumpy edge using FBM
          float edgeN = fbm2(suv * 5.0 + uTime * 0.035) * 0.16;
          float effD  = dist - edgeN;
          if(effD > 0.64) discard;

          // ── Central bar (elongated along rotated X) ──────────
          float bar = exp(-(ruv.x*ruv.x*18.0 + ruv.y*ruv.y*42.0));

          // ── 2 logarithmic spiral arms ─────────────────────────
          float armDen = 0.0;
          for(int i=0;i<2;i++){
            float phase  = float(i)*PI;
            float aAng   = rang + phase;
            float spiral = aAng - log(max(rdist*5.5,0.02))*2.5;
            spiral       = mod(spiral+PI, PI*2.0) - PI;
            float arm    = exp(-abs(spiral)*3.0);
            arm         *= smoothstep(0.04,0.11,rdist) * exp(-rdist*rdist*5.0);
            armDen      += arm;
          }
          armDen = clamp(armDen,0.0,1.0);

          // ── Dust lanes (between arms, slightly offset) ────────
          float dustDen = 0.0;
          for(int i=0;i<2;i++){
            float phase  = float(i)*PI + PI*0.55;
            float aAng   = rang + phase;
            float spiral = aAng - log(max(rdist*5.5,0.02))*2.5;
            spiral       = mod(spiral+PI, PI*2.0) - PI;
            float d      = exp(-abs(spiral)*4.2);
            d           *= smoothstep(0.08,0.20,rdist) * exp(-rdist*rdist*6.5);
            dustDen     += d;
          }
          dustDen = clamp(dustDen,0.0,0.88);

          // ── Radial disk ───────────────────────────────────────
          float radial = exp(-rdist*rdist*2.6);

          // ── Texture noise ─────────────────────────────────────
          float n  = fbm2(ruv*5.5 + uTime*0.022);
          float n2 = fbm2(ruv*14.0 - uTime*0.016);

          // ── Combine density ───────────────────────────────────
          float den = radial*0.42 + armDen*0.88 + bar*1.15;
          den      *= (0.72 + n*0.55);
          den      *= (1.0 - dustDen*0.75);
          den       = clamp(den, 0.0, 1.5);

          // ── Stars (bright hits in arm regions) ────────────────
          float starN  = pow(max(0.0, n2 - 0.70)/0.30, 3.5);
          float starVal = starN * (armDen*2.8 + radial*0.6);

          // ── Color ─────────────────────────────────────────────
          vec3 coreCol  = vec3(1.00, 0.96, 0.78); // warm yellow-white
          vec3 armCol   = vec3(0.65, 0.82, 1.00); // cool blue-white
          vec3 outerCol = vec3(0.26, 0.08, 0.48); // deep purple
          vec3 dustCol  = vec3(0.10, 0.03, 0.20); // near-black purple

          float ct  = smoothstep(0.0, 0.30, dist);
          vec3  col = mix(coreCol, armCol, ct*1.9);
          col       = mix(col, outerCol, smoothstep(0.26,0.62,dist));
          col      += armDen * 0.28 * armCol;        // arm highlight
          col      -= dustDen * 0.55 * col;           // dust darkening
          col      += starVal * vec3(0.92,0.96,1.0);  // star sparkle

          // Edge soft fade
          float ef    = 1.0 - smoothstep(0.45, 0.65, effD);
          float alpha = den * ef * uOpen * (0.65 + uApproach*0.35);

          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
      side:        THREE.DoubleSide,
    });

    // Non-square plane — galaxies are oblate
    this.disc = new THREE.Mesh(new THREE.PlaneGeometry(15, 13, 1, 1), mat);
    this.group.add(this.disc);
  }

  /* ── SPIRAL ARM PARTICLES ────────────────────────────────────── */
  _buildArmParticles() {
    const COUNT = 600;
    const pos   = new Float32Array(COUNT * 3);
    const col   = new Float32Array(COUNT * 3);
    this._aAng  = new Float32Array(COUNT);
    this._aRad  = new Float32Array(COUNT);
    this._aSpd  = new Float32Array(COUNT);
    this._aInitR = new Float32Array(COUNT);

    const palette = [
      [1.0, 0.94, 0.72],  // warm yellow
      [0.72, 0.86, 1.0],  // cool blue
      [1.0,  1.0,  0.96], // white
      [0.88, 0.72, 1.0],  // soft purple
    ];

    for (let i = 0; i < COUNT; i++) {
      const arm    = i % 2;
      const t      = Math.random();
      const radius = 0.8 + t * 8.0;    // extend well beyond disc edge
      const winding = 2.5;
      const spiralAngle = Math.log(radius * 5.5) / winding + arm * Math.PI;
      const scatter     = (Math.random() - 0.5) * 1.4;
      const angle       = spiralAngle + scatter;

      this._aAng[i]   = angle;
      this._aRad[i]   = radius;
      this._aInitR[i] = radius;
      this._aSpd[i]   = (0.12 + Math.random() * 0.22) / Math.sqrt(radius + 1);

      pos[i * 3]     = Math.cos(angle) * radius * 0.82;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.9;

      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    this._aPos = pos;
    this._aN   = COUNT;

    this.armMat = new THREE.PointsMaterial({
      size: 0.09, vertexColors: true,
      transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    this.armPoints = new THREE.Points(geo, this.armMat);
    this.group.add(this.armPoints);
  }

  /* ── STATIC STAR FIELD ───────────────────────────────────────── */
  _buildStarField() {
    const COUNT = 900;
    const pos   = new Float32Array(COUNT * 3);
    const col   = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const r = Math.pow(Math.random(), 0.6) * 7.5;
      const a = Math.random() * Math.PI * 2;
      pos[i * 3]     = Math.cos(a) * r * 0.82;
      pos[i * 3 + 1] = Math.sin(a) * r;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
      sizes[i] = 0.03 + Math.random() * 0.07;

      const t = Math.random();
      if      (t < 0.30) { col[i*3]=1.0;  col[i*3+1]=0.95; col[i*3+2]=0.72; } // warm
      else if (t < 0.65) { col[i*3]=0.78; col[i*3+1]=0.90; col[i*3+2]=1.0;  } // cool
      else               { col[i*3]=1.0;  col[i*3+1]=1.0;  col[i*3+2]=1.0;  } // white
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

    this.starMat = new THREE.PointsMaterial({
      size: 0.045, vertexColors: true,
      transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.stars = new THREE.Points(geo, this.starMat);
    this.group.add(this.stars);
  }

  /* ── CORE GLOW ───────────────────────────────────────────────── */
  _buildCore() {
    this.coreMat = new THREE.MeshBasicMaterial({
      color: 0xffe8a0, transparent: true, opacity: 0,
    });
    this.core = new THREE.Mesh(new THREE.SphereGeometry(0.30, 16, 16), this.coreMat);
    this.group.add(this.core);

    // Warm light — matches galaxy core color
    this.coreLight = new THREE.PointLight(0xffcc55, 0, 35);
    this.coreLight.position.set(0, 0, 0.4);
    this.group.add(this.coreLight);

    // Outer purple halo
    this.haloMat = new THREE.MeshBasicMaterial({
      color: 0x1a0635, transparent: true, opacity: 0,
      side: THREE.BackSide, depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.halo = new THREE.Mesh(new THREE.SphereGeometry(9, 16, 16), this.haloMat);
    this.group.add(this.halo);
  }

  /* ── UPDATE ─────────────────────────────────────────────────── */
  update(time, scrollProgress, cameraZ) {
    // Open ramp — slow reveal over ~5 seconds from scene start
    this.openProgress = Math.min(1, this.openProgress + 0.003);

    // Fade out once camera passes through
    const passThru = Math.max(0, (scrollProgress - 0.09) / 0.04);
    const vis      = this.openProgress * Math.max(0, 1 - passThru * 2.5);

    // Scale: portal "opens up" from small to full size
    const sc = 0.25 + this.openProgress * 0.75;
    this.group.scale.setScalar(sc);

    // Slow whole-galaxy rotation around Z
    this.group.rotation.z = time * 0.04;

    // Camera approach 0→1
    const camDist = Math.max(0, cameraZ - this.group.position.z);
    const approach = 1 - Math.min(1, camDist / 14);

    // Disc
    this.discUni.uTime.value     = time;
    this.discUni.uOpen.value     = vis;
    this.discUni.uApproach.value = approach;

    // Core pulse
    const pulse = 0.55 + Math.sin(time * 2.5) * 0.22;
    this.coreMat.opacity      = vis * pulse * 0.88;
    this.core.scale.setScalar(0.8 + pulse * 0.45);
    this.coreLight.intensity  = vis * 5 * (1 + approach * 5);
    this.haloMat.opacity      = vis * 0.14;

    // Arm particles — orbit + suck inward when close
    this.armMat.opacity = vis * 0.80;
    const suck = approach * 0.0035;
    for (let i = 0; i < this._aN; i++) {
      this._aAng[i] += this._aSpd[i] * (1 + approach * 2.2);
      this._aRad[i]  = Math.max(0.35, this._aRad[i] - suck);
      if (this._aRad[i] < 0.4) this._aRad[i] = this._aInitR[i]; // respawn
      const r = this._aRad[i];
      const a = this._aAng[i];
      this._aPos[i * 3]     = Math.cos(a) * r * 0.82;
      this._aPos[i * 3 + 1] = Math.sin(a) * r;
    }
    this.armPoints.geometry.attributes.position.needsUpdate = true;

    // Stars fade in
    this.starMat.opacity = vis * 0.60;
  }
}
