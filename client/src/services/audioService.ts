class AudioService {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;

  constructor() {
    // 事前に音声をロード
    this.preloadSounds();
  }

  private preloadSounds(): void {
    const soundFiles = {
      start: "/sounds/game-start.mp3",
      stone: "/sounds/stone-place.mp3",
      win: "/sounds/game-win.mp3",
      lose: "/sounds/game-lose.mp3",
      draw: "/sounds/game-draw.mp3",
    };

    for (const [name, path] of Object.entries(soundFiles)) {
      const audio = new Audio(path);
      audio.load(); // 事前ロード
      this.sounds.set(name, audio);
    }
  }

  public playSound(sound: "start" | "stone" | "win" | "lose" | "draw"): void {
    if (!this.enabled) return;

    const audio = this.sounds.get(sound);
    if (audio) {
      // 音を最初から再生するためにresetする
      audio.pause();
      audio.currentTime = 0;
      audio.play().catch((err) => {
        console.warn("Audio playback failed:", err);
      });
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }
}

// シングルトンインスタンス
const audioService = new AudioService();

export default audioService;
