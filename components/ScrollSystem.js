import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default class ScrollSystem {
  constructor(camera, dnaGroup) {
    this.camera = camera;
    this.dnaGroup = dnaGroup;

    this.createTimeline();
  }

  createTimeline() {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: '+=4000',
        scrub: true,
        pin: true
      }
    });

    // CAMERA START POSITION
    this.camera.position.set(0, 0, 8);

    // SCENE 1 — APPROACH DNA
    tl.to(this.camera.position, {
      z: 4,
      duration: 2
    });

    // ORBIT AROUND DNA
    tl.to(this.camera.position, {
      x: 3,
      z: 3,
      duration: 3
    });

    // ROTATE DNA
    tl.to(this.dnaGroup.rotation, {
      y: Math.PI * 2,
      duration: 3
    }, '<');

    // GO THROUGH DNA
    tl.to(this.camera.position, {
      z: 0.5,
      duration: 2
    });

    // FINAL PUSH
    tl.to(this.camera.position, {
      z: -5,
      duration: 2
    });
  }
}
