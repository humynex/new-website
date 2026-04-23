export default class AudioSystem {
  constructor() {
    this.sounds = {};
    this.muted  = false;

    this.load('ambient', '/public/sounds/ambient.mp3', { loop: true, volume: 0.3 });
    this.load('hover',   '/public/sounds/hover.mp3',   { volume: 0.5 });
    this.load('click',   '/public/sounds/click.mp3',   { volume: 0.7 });
  }

  load(name, src, { loop = false, volume = 1 } = {}) {
    const audio  = new Audio(src);
    audio.loop   = loop;
    audio.volume = volume;
    this.sounds[name] = audio;
  }

  play(name) {
    if (this.muted) return;
    const sound = this.sounds[name];
    if (!sound) return;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  startAmbient() {
    this.sounds.ambient?.play().catch(() => {});
  }

  mute() {
    this.muted = true;
    Object.values(this.sounds).forEach(s => s.pause());
  }

  unmute() {
    this.muted = false;
    this.startAmbient();
  }
}
