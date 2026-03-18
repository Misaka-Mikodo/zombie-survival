// 音效管理器
export class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  
  constructor() {
    this.loadSounds();
  }
  
  private loadSounds() {
    // 预留音效接口
    // 实际需要添加音频文件
  }
  
  play(name: string) {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
  }
  
  stop(name: string) {
    const sound = this.sounds.get(name);
    if (sound) sound.pause();
  }
}
