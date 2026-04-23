/**
 * DNAScene — Cinematic Teal Helix
 * Matches reference: glowing teal/cyan smooth strands, node spheres at
 * every rung endpoint, atmospheric halo, dark space background.
 *
 * Usage:
 *   const dna = new DNAScene(scene, camera);
 *   // in animation loop:
 *   dna.update(mouse); // mouse = { x: [-1,1], y: [-1,1] }
 */

import * as THREE from 'three';
import gsap from 'gsap';

export default class DNAScene {
  constructor(scene, camera) {
    this.scene      = scene;
    this.camera     = camera;
    this.clock      = new THREE.Clock();
    this.particles  = [];
    this.isBreaking = false;

    // Root group — everything lives here for easy group transforms
    this.group = new THREE.Group();
    this.group.name = 'dnaGroup';
    this.scene.add(this.group);

    // Scene atmosphere
    this.scene.background = new THREE.Color(0x020609);
    this.scene.fog = new THREE.FogExp2(0x020812, 0.028);

    this._buildMaterials();
    this._buildHelix();
    this._buildAtmosphere();
    this._buildParticles();
    this._buildLights();
  }

  /* ─────────────────────────────────────────────────────────────
     MATERIALS
  ───────────────────────────────────────────────────────────── */
  _buildMaterials() {

    // Primary helix strand — teal glass with clearcoat shine
    this.mStrand = new THREE.MeshPhysicalMaterial({
      color              : 0x00e8d8,
      emissive           : 0x00b4a8,
      emissiveIntensity  : 0.65,
      metalness          : 0.08,
      roughness          : 0.10,
      clearcoat          : 1.0,
      clearcoatRoughness : 0.04,
      transparent        : true,
      opacity            : 0.92,
    });

    // Connector rung — brighter, crisper
    this.mRung = new THREE.MeshPhysicalMaterial({
      color              : 0x88f0ff,
      emissive           : 0x44bbd0,
      emissiveIntensity  : 0.55,
      metalness          : 0.0,
      roughness          : 0.08,
      clearcoat          : 1.0,
      clearcoatRoughness : 0.04,
      transparent        : true,
      opacity            : 0.80,
    });

    // Node spheres at rung endpoints — hottest point of the molecule
    this.mNode = new THREE.MeshPhysicalMaterial({
      color              : 0x22ffee,
      emissive           : 0x00ddcc,
      emissiveIntensity  : 1.4,
      metalness          : 0.25,
      roughness          : 0.04,
      clearcoat          : 1.0,
      clearcoatRoughness : 0.02,
    });

    // Atmospheric cylinder halo
    this.mHalo = new THREE.MeshBasicMaterial({
      color      : 0x00c8d4,
      transparent: true,
      opacity    : 0.04,
      side       : THREE.BackSide,
      blending   : THREE.AdditiveBlending,
      depthWrite : false,
    });

    // Particle dust
    this.mDust = new THREE.PointsMaterial({
      color      : 0x44ccdd,
      size       : 0.038,
      transparent: true,
      opacity    : 0.60,
      blending   : THREE.AdditiveBlending,
      depthWrite : false,
    });
  }

  /* ─────────────────────────────────────────────────────────────
     HELIX GEOMETRY
  ───────────────────────────────────────────────────────────── */
  _buildHelix() {
    const TURNS   = 8;     // number of helical turns
    const RADIUS  = 2.1;   // helix radius
    const HEIGHT  = 15;    // total height
    const PAIRS   = 32;    // base pair count
    const SEG     = 160;   // tube path segments
    const TUBE_R  = 0.21;  // tube cross-section radius
    const TUBE_PS = 16;    // tube radial segments
    const NODE_R  = TUBE_R * 1.55;  // node sphere radius at rung endpoints
    const RUNG_R  = 0.045;          // rung cylinder radius

    // Helix curve factory
    const makeCurve = (phaseOffset) => {
      const c = new THREE.Curve();
      c.getPoint = (t) => {
        const a = t * Math.PI * 2 * TURNS + phaseOffset;
        return new THREE.Vector3(
          Math.cos(a) * RADIUS,
          (t - 0.5) * HEIGHT,
          Math.sin(a) * RADIUS
        );
      };
      return c;
    };

    const curve1 = makeCurve(0);
    const curve2 = makeCurve(Math.PI);

    // Store for animation
    this._c1 = curve1;
    this._c2 = curve2;

    // Tube strands — high-poly for that smooth, expensive look
    this.strand1 = new THREE.Mesh(
      new THREE.TubeGeometry(curve1, SEG, TUBE_R, TUBE_PS, false),
      this.mStrand
    );
    this.strand2 = new THREE.Mesh(
      new THREE.TubeGeometry(curve2, SEG, TUBE_R, TUBE_PS, false),
      this.mStrand
    );
    this.group.add(this.strand1, this.strand2);

    // Shared node geometry (reused per instance manually — keeps memory low)
    const nodeGeo = new THREE.SphereGeometry(NODE_R, 8, 6);

    for (let i = 0; i < PAIRS; i++) {
      const t  = i / PAIRS;
      const p1 = curve1.getPoint(t);
      const p2 = curve2.getPoint(t);

      const dir = new THREE.Vector3().subVectors(p2, p1);
      const len = dir.length();
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

      // Rung cylinder (individual geometry for exact length)
      const rung = new THREE.Mesh(
        new THREE.CylinderGeometry(RUNG_R, RUNG_R, len, 12, 1),
        this.mRung
      );
      rung.position.copy(mid);
      rung.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir.normalize()
      );
      this.group.add(rung);

      // Node spheres at both endpoints — these are the "atoms"
      const n1 = new THREE.Mesh(nodeGeo, this.mNode);
      const n2 = new THREE.Mesh(nodeGeo, this.mNode);
      n1.position.copy(p1);
      n2.position.copy(p2);
      this.group.add(n1, n2);
    }
  }

  /* ─────────────────────────────────────────────────────────────
     ATMOSPHERIC HALO
  ───────────────────────────────────────────────────────────── */
  _buildAtmosphere() {
    // Outer soft cylinder — catches rim light and mimics volumetric glow
    const halo = new THREE.Mesh(
      new THREE.CylinderGeometry(4.2, 4.2, 17, 40, 1, true),
      this.mHalo
    );
    this.group.add(halo);

    // Inner tighter glow band
    const inner = new THREE.Mesh(
      new THREE.CylinderGeometry(2.8, 2.8, 17, 32, 1, true),
      new THREE.MeshBasicMaterial({
        color      : 0x00e8e0,
        transparent: true,
        opacity    : 0.025,
        side       : THREE.BackSide,
        blending   : THREE.AdditiveBlending,
        depthWrite : false,
      })
    );
    this.group.add(inner);
  }

  /* ─────────────────────────────────────────────────────────────
     PARTICLE DUST
  ───────────────────────────────────────────────────────────── */
  _buildParticles() {
    const N   = 150;
    const pos = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r     = 3.0 + Math.random() * 4.5;
      pos[i * 3]     = Math.cos(theta) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = Math.sin(theta) * r;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    this.dustParticles = new THREE.Points(geo, this.mDust);
    this.group.add(this.dustParticles);
  }

  /* ─────────────────────────────────────────────────────────────
     LIGHTING
  ───────────────────────────────────────────────────────────── */
  _buildLights() {
    // Barely-there ambient — keep it dramatic, not washed out
    this.scene.add(new THREE.AmbientLight(0x030a12, 1.0));

    // Key — cool blue-white from top-right, creates the highlight along the strand
    const key = new THREE.DirectionalLight(0xd0f0ff, 1.6);
    key.position.set(6, 14, 7);
    this.scene.add(key);

    // Fill — teal from opposite side, softens shadows with DNA color
    const fill = new THREE.DirectionalLight(0x00ddcc, 0.55);
    fill.position.set(-7, 1, -4);
    this.scene.add(fill);

    // Rim/back — pure white edge for silhouette separation from background
    const rim = new THREE.DirectionalLight(0xffffff, 0.70);
    rim.position.set(0, -14, -10);
    this.scene.add(rim);

    // Bottom up-light — cold blue, makes the base of the helix glow upward
    const up = new THREE.PointLight(0x003355, 2.8, 24);
    up.position.set(0, -12, 0);
    this.scene.add(up);

    // Two orbiting cinematic lights — animated in update()
    // orb1: bright teal, traces around the helix
    // orb2: electric blue, opposite side
    this.orb1 = new THREE.PointLight(0x00ffee, 6.0, 16);
    this.orb2 = new THREE.PointLight(0x0055ff, 4.5, 14);
    this.scene.add(this.orb1, this.orb2);
  }

  /* ─────────────────────────────────────────────────────────────
     ANIMATION  —  call every frame
  ───────────────────────────────────────────────────────────── */
  update(mouse) {
    const t = this.clock.getElapsedTime();

    // ── Slow, majestic axial rotation
    this.group.rotation.y += 0.0035;

    // ── Subtle vertical float
    this.group.position.y = Math.sin(t * 0.38) * 0.18;

    // ── Mouse parallax — smooth lag
    this.group.rotation.x += (mouse.y * 0.28 - this.group.rotation.x) * 0.04;
    this.group.rotation.y += (mouse.x * 0.28 - this.group.rotation.y) * 0.04;

    // ── Orbit the two dynamic point lights around the helix
    const or = 5.4;
    this.orb1.position.set(
      Math.cos(t * 0.40) * or,
      Math.sin(t * 0.26) * 5.0,
      Math.sin(t * 0.40) * or
    );
    this.orb2.position.set(
      Math.cos(t * 0.40 + Math.PI) * or,
      Math.sin(t * 0.26 + 2.0) * 5.0,
      Math.sin(t * 0.40 + Math.PI) * or
    );

    // ── Strand emissive breath — the whole helix "breathes"
    const breath = 0.55 + Math.sin(t * 1.3) * 0.18;
    this.mStrand.emissiveIntensity = breath;
    this.mRung.emissiveIntensity   = breath * 0.85;

    // ── Node spheres pulse slightly faster — like electrical activity
    this.mNode.emissiveIntensity = 1.1 + Math.sin(t * 2.2) * 0.38;

    // ── Particle counter-rotation creates a surrounding halo of depth
    this.dustParticles.rotation.y -= 0.0006;

    // ── Break animation — spin and fly particles toward camera
    if (this.isBreaking && this.breakParticles) {
      this.breakParticles.rotation.y += 0.01;
      this.breakParticles.position.z -= 0.05;
    }
  }

  /* ─────────────────────────────────────────────────────────────
     BREAK EFFECT — explode helix into particles on transition
  ───────────────────────────────────────────────────────────── */
  createBreakParticles() {
    const geometry = new THREE.BufferGeometry();
    const count = 600;

    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x00ccff,
      transparent: true,
      opacity: 1
    });

    this.breakParticles = new THREE.Points(geometry, material);
    this.scene.add(this.breakParticles);
  }

  triggerBreak() {
    this.isBreaking = true;

    this.group.visible = false;

    if (!this.breakParticles) {
      this.createBreakParticles();
    }
  }
}
