import * as THREE from 'three';
import gsap from 'gsap';

const PARTS_PER_BUILDING = 80;

export default class AIWorld {
  constructor(scene, camera, sounds = {}) {
    this.scene   = scene;
    this.camera  = camera;
    this.sounds  = sounds;

    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.group.visible = false;

    this.raycaster   = new THREE.Raycaster();
    this.mouse       = new THREE.Vector2();
    this._frame      = 0;
    this._cursor     = document.querySelector('.cursor');

    this.buildings   = [];    // { mesh, points, pGeo, vels, origins, state }
    this.hoveredBldg = null;

    this.createEnvironment();
    this.createBuildings();
    this.createAmbientParticles();

    window.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  /* ── ENVIRONMENT ─────────────────────────────────────────────── */
  createEnvironment() {
    const grid = new THREE.GridHelper(80, 80, 0x00ccff, 0x001422);
    grid.position.y = -5;
    this.group.add(grid);

    const light1 = new THREE.PointLight(0x00ccff, 3, 60);
    light1.position.set(0, 8, 0);
    const light2 = new THREE.PointLight(0x7b2fff, 2, 50);
    light2.position.set(-10, 4, -8);
    const light3 = new THREE.PointLight(0x00ffaa, 1.5, 40);
    light3.position.set(10, 2, -12);
    this.group.add(light1, light2, light3);
  }

  /* ── BUILDINGS ───────────────────────────────────────────────── */
  createBuildings() {
    const BLDG_COUNT = 28;
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x00ccff, emissive: 0x003355,
      emissiveIntensity: 0.9, metalness: 0.95, roughness: 0.05,
      transparent: true, opacity: 0.72
    });
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x00ffff, transparent: true, opacity: 0.45
    });

    for (let i = 0; i < BLDG_COUNT; i++) {
      const w = 0.5 + Math.random() * 1.4;
      const h = 1.8 + Math.random() * 8;
      const d = 0.5 + Math.random() * 1.4;

      const geo  = new THREE.BoxGeometry(w, h, d);
      const mat  = baseMat.clone();
      const mesh = new THREE.Mesh(geo, mat);

      const col = i % 7;
      const row = Math.floor(i / 7);
      mesh.position.set(
        (col - 3) * 4.5 + (Math.random() - 0.5) * 2,
        -5 - h / 2,
        -2 - row * 4.5 + (Math.random() - 0.5) * 2
      );

      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat.clone());
      mesh.add(edges);
      this.group.add(mesh);

      // Particle pool for break effect
      const pPos    = new Float32Array(PARTS_PER_BUILDING * 3);
      const origins = [];
      const vels    = [];

      for (let p = 0; p < PARTS_PER_BUILDING; p++) {
        const ox = mesh.position.x + (Math.random() - 0.5) * w;
        const oy = mesh.position.y + (Math.random() - 0.5) * h;
        const oz = mesh.position.z + (Math.random() - 0.5) * d;
        pPos[p * 3]     = ox;
        pPos[p * 3 + 1] = oy;
        pPos[p * 3 + 2] = oz;
        origins.push(new THREE.Vector3(ox, oy, oz));
        vels.push(new THREE.Vector3());
      }

      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

      const pMat = new THREE.PointsMaterial({
        color: 0x00ffff, size: 0.10,
        transparent: true, opacity: 0, depthWrite: false,
        blending: THREE.AdditiveBlending
      });

      const points = new THREE.Points(pGeo, pMat);
      this.group.add(points);

      this.buildings.push({ mesh, points, pGeo, vels, origins, state: 'solid' });
    }
  }

  /* ── AMBIENT PARTICLES ───────────────────────────────────────── */
  createAmbientParticles() {
    const COUNT = 1200;
    const pos   = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    this.ambientPts = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0x00ccff, size: 0.06, transparent: true, opacity: 0.5,
      depthWrite: false, blending: THREE.AdditiveBlending
    }));
    this.group.add(this.ambientPts);
  }

  /* ── BUILDING EXPLOSION ──────────────────────────────────────── */
  _explodeBuilding(b) {
    if (b.state !== 'solid') return;
    b.state = 'exploding';
    b.mesh.visible = false;
    b.points.material.opacity = 0.9;

    const arr = b.pGeo.attributes.position.array;
    for (let p = 0; p < PARTS_PER_BUILDING; p++) {
      arr[p * 3]     = b.origins[p].x;
      arr[p * 3 + 1] = b.origins[p].y;
      arr[p * 3 + 2] = b.origins[p].z;
      b.vels[p].set(
        (Math.random() - 0.5) * 0.18,
        (Math.random() - 0.5) * 0.18 + 0.04,
        (Math.random() - 0.5) * 0.18
      );
    }
    b.pGeo.attributes.position.needsUpdate = true;
  }

  _reformBuilding(b) {
    if (b.state === 'solid') return;
    b.state = 'reforming';
  }

  _updateBuildingParticles() {
    this.buildings.forEach(b => {
      if (b.state === 'solid') return;
      const arr = b.pGeo.attributes.position.array;

      if (b.state === 'exploding') {
        for (let p = 0; p < PARTS_PER_BUILDING; p++) {
          arr[p * 3]     += b.vels[p].x;
          arr[p * 3 + 1] += b.vels[p].y;
          arr[p * 3 + 2] += b.vels[p].z;
          b.vels[p].multiplyScalar(0.96);
        }
      }

      if (b.state === 'reforming') {
        let allHome = true;
        for (let p = 0; p < PARTS_PER_BUILDING; p++) {
          const dx = b.origins[p].x - arr[p * 3];
          const dy = b.origins[p].y - arr[p * 3 + 1];
          const dz = b.origins[p].z - arr[p * 3 + 2];
          if (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) > 0.02) {
            allHome = false;
            arr[p * 3]     += dx * 0.1;
            arr[p * 3 + 1] += dy * 0.1;
            arr[p * 3 + 2] += dz * 0.1;
          }
        }
        if (allHome) {
          b.state = 'solid';
          b.mesh.visible = true;
          b.points.material.opacity = 0;
        }
      }

      b.pGeo.attributes.position.needsUpdate = true;
    });
  }

  /* ── HOVER ───────────────────────────────────────────────────── */
  checkHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Check buildings — explode on hover, reform on leave
    const bldgMeshes = this.buildings.map(b => b.mesh).filter(m => m.visible);
    const bldgHits   = this.raycaster.intersectObjects(bldgMeshes);
    const bldgMesh   = bldgHits.length > 0 ? bldgHits[0].object : null;
    const bldgObj    = bldgMesh ? this.buildings.find(b => b.mesh === bldgMesh) : null;

    if (bldgObj !== this.hoveredBldg) {
      if (this.hoveredBldg) this._reformBuilding(this.hoveredBldg);
      this.hoveredBldg = bldgObj;
      if (bldgObj) {
        if (this.sounds.hover) { this.sounds.hover.currentTime = 0; this.sounds.hover.play().catch(() => {}); }
        this._explodeBuilding(bldgObj);
      }
    }

    if (this._cursor) this._cursor.classList.toggle('active', !!bldgObj);
  }

  onMouseMove(e) {
    this.mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  /* ── UPDATE ──────────────────────────────────────────────────── */
  update(time) {
    // Slow world drift
    this.group.rotation.y += 0.0003;

    // Ambient particles drift
    if (this.ambientPts) this.ambientPts.rotation.y += 0.0004;

    // Building particle animations
    this._updateBuildingParticles();

    // Building glow pulse
    this.buildings.forEach((b, i) => {
      if (b.state === 'solid' && b.mesh.material) {
        b.mesh.material.emissiveIntensity = 0.7 + Math.sin(time * 1.2 + i) * 0.3;
      }
    });

    // Throttled raycasting
    this._frame++;
    if (this._frame % 2 === 0) {
      this.checkHover();
    }
  }

  show() { this.group.visible = true; }
  hide() { this.group.visible = false; }
}
