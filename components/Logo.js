import * as THREE from 'three';

export default class Logo {
  constructor(scene) {
    this.scene = scene;

    const geometry = new THREE.TorusKnotGeometry(1, 0.2, 100, 16);

    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x00ccff,
      emissiveIntensity: 1.5
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, 0, 2);
    // Not added to scene — removed per design revision
  }

  update(time) {
    this.mesh.rotation.x += 0.01;
    this.mesh.rotation.y += 0.01;
  }
}
