import * as THREE from 'three';

export default class Nebula {
  constructor(scene) {
    this.scene = scene;
    this._buildStars();
    this._buildClouds();
  }

  _buildStars() {
    const COUNT = 3000;
    const pos   = new Float32Array(COUNT * 3);
    const col   = new Float32Array(COUNT * 3);

    const palette = [
      [0.5, 0.8, 1.0],   // cool blue
      [0.7, 0.5, 1.0],   // purple
      [1.0, 1.0, 1.0],   // white
      [0.4, 1.0, 0.9],   // cyan
    ];

    for (let i = 0; i < COUNT; i++) {
      // Sphere shell distribution
      const phi   = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r     = 80 + Math.random() * 60;

      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3]     = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.scene.add(new THREE.Points(geo, mat));
  }

  _buildClouds() {
    // Soft nebula planes — large semi-transparent quads at depth
    const configs = [
      { color: 0x0a0040, pos: [-30, 10, -60],  size: 80, opacity: 0.18 },
      { color: 0x00044a, pos: [ 40,-15, -80],  size: 90, opacity: 0.14 },
      { color: 0x2a0050, pos: [  0, 20,-100],  size: 110, opacity: 0.12 },
      { color: 0x001a30, pos: [-50, -5, -50],  size: 70,  opacity: 0.16 },
    ];

    configs.forEach(({ color, pos, size, opacity }) => {
      const geo = new THREE.PlaneGeometry(size, size);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...pos);
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      this.scene.add(mesh);
    });
  }

  update(time) {
    // Slow nebula drift — barely perceptible
  }
}
