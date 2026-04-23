class Particles {
  constructor(scene) {
    this.scene = scene;

    const count = 2000;
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x00ccff,
      transparent: true,
      opacity: 0.6,
      depthWrite: false
    });

    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);
  }

  update(time) {
    this.points.rotation.y += 0.0005;
    this.points.rotation.x += 0.0002;
  }
}
