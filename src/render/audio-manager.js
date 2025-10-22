class AudioManager {
  constructor() {
    this.currentBgm = null;
  }

  playBgm(path) {
    if (this.currentBgm) {
      this.currentBgm.pause();
      this.currentBgm = null;
    }
    this.currentBgm = new Audio(path);
    this.currentBgm.loop = true;
    this.currentBgm.volume = 0.5;
    this.currentBgm.play().catch(() => {});
  }

  playSfx(path) {
    const audio = new Audio(path);
    audio.volume = 0.7;
    audio.play().catch(() => {});
  }
}

export const audioManager = new AudioManager();