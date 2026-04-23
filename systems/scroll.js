import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default class ScrollSystem {
  constructor(camera, dna, aiWorld, logo, pricingWorld) {
    this.camera       = camera;
    this.dna          = dna;
    this.aiWorld      = aiWorld;
    this.logo         = logo;
    this.pricingWorld = pricingWorld;

    this.createTimeline();
  }

  createTimeline() {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: '+=5000',
        scrub: true,
        pin: true
      }
    });

    // APPROACH DNA
    tl.to(this.camera.position, {
      z: 4,
      duration: 2
    });

    // ORBIT
    tl.to(this.camera.position, {
      x: 3,
      z: 3,
      duration: 3
    });

    // ROTATE DNA
    tl.to(this.dna.group.rotation, {
      y: Math.PI * 2,
      duration: 3
    }, '<');

    // MOVE INTO DNA
    tl.to(this.camera.position, {
      z: 1,
      duration: 2
    });

    // BREAK DNA + COLLAPSE LOGO
    tl.call(() => {
      this.dna.triggerBreak();

      gsap.to(this.logo.mesh.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1
      });
    });

    // FLY FORWARD
    tl.to(this.camera.position, {
      z: -10,
      duration: 3
    });

    // SHOW AI WORLD
    tl.call(() => {
      this.aiWorld.show();
    });

    // FLY TO PRICING
    tl.to(this.camera.position, {
      z: -20,
      duration: 3
    });

    // SHOW PRICING WORLD
    tl.call(() => {
      this.pricingWorld.show();
    });
  }
}
