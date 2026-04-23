import * as THREE from 'three';

export default class AIWorld {
  constructor(scene) {
    this.scene = scene;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.group.visible = false;

    this.createEnvironment();
  }

  createEnvironment() {
    // FLOOR GRID
    const grid = new THREE.GridHelper(50, 50, 0x00ccff, 0x003344);
    grid.position.y = -5;
    this.group.add(grid);

    // FLOATING PANELS (placeholder for portfolio)
    const geo = new THREE.PlaneGeometry(3, 2);

    for (let i = 0; i < 6; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.1
      });

      const panel = new THREE.Mesh(geo, mat);

      panel.position.set(
        (Math.random() - 0.5) * 10,
        Math.random() * 4,
        -Math.random() * 10
      );

      panel.rotation.y = Math.random() * Math.PI;

      this.group.add(panel);
    }

    // LIGHT
    const light = new THREE.PointLight(0x00ccff, 2, 30);
    light.position.set(0, 5, 5);
    this.group.add(light);
  }

  show() {
    this.group.visible = true;
  }

  update(time) {
    this.group.rotation.y += 0.0005;
  }
}
