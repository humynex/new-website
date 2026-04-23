import * as THREE from 'three';

export default class PricingWorld {
  constructor(scene) {
    this.scene = scene;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.group.visible = false;

    this.createCards();
  }

  createCards() {
    const geo = new THREE.PlaneGeometry(3, 4);

    for (let i = 0; i < 3; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true
      });

      const card = new THREE.Mesh(geo, mat);

      card.position.set(i * 4 - 4, 0, -5);

      this.group.add(card);
    }
  }

  show() { this.group.visible = true; }
  hide() { this.group.visible = false; }
}
