import * as THREE from 'three';

// Hue → RGB (0–1 range)
function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return new THREE.Color(r, g, b);
}

export default class Drones {
  constructor(scene) {
    this.scene  = scene;
    this.drones = [];
    this._build();
  }

  _build() {
    const COUNT = 26;

    for (let i = 0; i < COUNT; i++) {
      const group = new THREE.Group();

      // Body — flat hexagonal box
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x00aaff, emissive: 0x002244,
        metalness: 0.9, roughness: 0.1
      });
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.09, 0.32),
        bodyMat
      );
      group.add(body);

      // 4 rotor arms
      const armMat = new THREE.MeshStandardMaterial({
        color: 0x6633cc, emissive: 0x1a0044,
        metalness: 0.8, roughness: 0.2
      });
      const rotors = [];
      [[ 0.24, 0], [-0.24, 0], [0,  0.24], [0, -0.24]].forEach(([ax, az]) => {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.035, 0.045), armMat);
        arm.position.set(ax, 0, az);
        if (az !== 0) arm.rotation.y = Math.PI / 2;
        group.add(arm);

        // Rotor disc
        const rotor = new THREE.Mesh(
          new THREE.TorusGeometry(0.11, 0.016, 6, 14),
          new THREE.MeshBasicMaterial({ color: 0x0088ff, transparent: true, opacity: 0.5 })
        );
        rotor.position.set(ax, 0.055, az);
        rotor.rotation.x = Math.PI / 2;
        group.add(rotor);
        rotors.push(rotor);
      });

      // Belly LED — small glowing dot
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff });
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), ledMat);
      led.position.set(0, -0.06, 0);
      group.add(led);

      // Glow light — brighter than before
      const light = new THREE.PointLight(0x0099ff, 1.2, 6);
      light.position.set(0, 0.15, 0);
      group.add(light);

      // Flight path — spread through scenes, with a cluster near start
      const angle  = (i / COUNT) * Math.PI * 2;
      const rx     = 5 + Math.random() * 16;
      const ry     = 1.2 + Math.random() * 3.5;
      const rz     = 5 + Math.random() * 12;
      const baseZ  = i < 6
        ? -Math.random() * 8          // first 6 drones stay near hero/DNA
        : -8 - Math.random() * 30;    // rest spread through all scenes
      const speed  = 0.16 + Math.random() * 0.24;
      const phase  = Math.random() * Math.PI * 2;
      const yBase  = (Math.random() - 0.5) * 8;
      // Per-drone hue offset for color cycling
      const hueOff = Math.random();

      this.drones.push({
        group, bodyMat, ledMat, light, rotors,
        rx, ry, rz, baseZ, speed, phase, yBase, angle, hueOff
      });
      this.scene.add(group);
    }
  }

  update(time) {
    this._tick = (this._tick || 0) + 1;
    const updateColors = (this._tick % 2 === 0);
    this.drones.forEach(d => {
      const t = time * d.speed + d.phase;

      // Position
      d.group.position.set(
        Math.cos(t) * d.rx,
        d.yBase + Math.sin(t * 1.3) * d.ry,
        d.baseZ + Math.sin(t * 0.7) * d.rz
      );

      // Face direction of travel
      d.group.rotation.y = -t + Math.PI / 2;
      d.group.rotation.z = Math.sin(t) * 0.28;

      // Spin rotors
      d.rotors.forEach(r => { r.rotation.z += 0.38; });

      if (updateColors) {
        // Cycle hue over time — blue range only (0.50–0.75 = cyan → blue → violet)
        const hue = 0.50 + ((d.hueOff + time * 0.065) % 0.25);
        const col = hslToRgb(hue, 1.0, 0.62);
        d.bodyMat.color.copy(col);
        d.bodyMat.emissive.setRGB(col.r * 0.18, col.g * 0.18, col.b * 0.18);
        d.ledMat.color.copy(col);
        d.light.color.copy(col);
      }

      // Pulse light intensity
      d.light.intensity = 0.9 + Math.sin(time * 3.5 + d.phase) * 0.4;
    });
  }
}
