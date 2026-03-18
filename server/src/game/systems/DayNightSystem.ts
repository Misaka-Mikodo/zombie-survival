// 昼夜循环系统
import { DayPhase } from '../../types/game';

export class DayNightSystem {
  private phase: DayPhase = 'day';
  private dayTime: number = 0; // 0-1, 代表一天中的比例
  private dayNumber: number = 1;
  
  // 游戏内时间设置
  private readonly DAY_LENGTH = 6 * 60 * 1000; // 6分钟 = 白天
  private readonly NIGHT_LENGTH = 2 * 60 * 1000; // 2分钟 = 夜晚
  private readonly TWILIGHT_LENGTH = 5 * 60 * 1000; // 5分钟 = 黄昏警告
  
  private readonly DAY_START = 0.25; // 6:00
  private readonly TWILIGHT_START = 0.75; // 18:00
  private readonly NIGHT_START = 0.833; // 20:00
  
  private onPhaseChange?: (phase: DayPhase) => void;
  private onNightStart?: () => void;
  private onDayStart?: () => void;
  
  constructor() {
    this.phase = 'day';
    this.dayTime = this.DAY_START;
  }
  
  update(deltaTime: number): void {
    const totalCycle = this.DAY_LENGTH + this.TWILIGHT_LENGTH + this.NIGHT_LENGTH;
    this.dayTime += deltaTime / totalCycle;
    
    if (this.dayTime >= 1) {
      this.dayTime -= 1;
      this.dayNumber++;
    }
    
    // 检测阶段转换
    const newPhase = this.calculatePhase();
    if (newPhase !== this.phase) {
      this.transitionTo(newPhase);
    }
  }
  
  private calculatePhase(): DayPhase {
    if (this.dayTime >= this.NIGHT_START) {
      return 'night';
    } else if (this.dayTime >= this.TWILIGHT_START) {
      return 'twilight';
    }
    return 'day';
  }
  
  private transitionTo(newPhase: DayPhase): void {
    const oldPhase = this.phase;
    this.phase = newPhase;
    
    if (this.onPhaseChange) {
      this.onPhaseChange(newPhase);
    }
    
    // 夜晚开始
    if (newPhase === 'night' && oldPhase !== 'night') {
      if (this.onNightStart) {
        this.onNightStart();
      }
    }
    
    // 白天开始
    if (newPhase === 'day' && oldPhase !== 'day') {
      if (this.onDayStart) {
        this.onDayStart();
      }
    }
  }
  
  // 获取当前时间（游戏内小时，0-24）
  getGameHour(): number {
    return this.dayTime * 24;
  }
  
  // 获取当前阶段
  getPhase(): DayPhase {
    return this.phase;
  }
  
  // 获取天数
  getDayNumber(): number {
    return this.dayNumber;
  }
  
  // 是否是夜晚
  isNight(): boolean {
    return this.phase === 'night';
  }
  
  // 获取光照强度 (0-1, 白天=0.2, 夜晚=0.8)
  getLightLevel(): number {
    switch (this.phase) {
      case 'day':
        return 0.2;
      case 'twilight':
        return 0.5;
      case 'night':
        return 0.85;
    }
  }
  
  // 获取剩余时间（毫秒）
  getTimeToNextPhase(): number {
    const totalCycle = this.DAY_LENGTH + this.TWILIGHT_LENGTH + this.NIGHT_LENGTH;
    const currentPosition = this.dayTime * totalCycle;
    
    switch (this.phase) {
      case 'day':
        return this.TWILIGHT_START * totalCycle - currentPosition;
      case 'twilight':
        return this.NIGHT_START * totalCycle - currentPosition;
      case 'night':
        return totalCycle - currentPosition + this.DAY_START * totalCycle;
    }
  }
  
  // 事件回调设置
  setOnPhaseChange(callback: (phase: DayPhase) => void): void {
    this.onPhaseChange = callback;
  }
  
  setOnNightStart(callback: () => void): void {
    this.onNightStart = callback;
  }
  
  setOnDayStart(callback: () => void): void {
    this.onDayStart = callback;
  }
  
  // 序列化（用于网络同步）
  serialize(): object {
    return {
      phase: this.phase,
      dayTime: this.dayTime,
      dayNumber: this.dayNumber,
    };
  }
  
  // 反序列化
  static deserialize(data: { phase: DayPhase; dayTime: number; dayNumber: number }): DayNightSystem {
    const system = new DayNightSystem();
    system.phase = data.phase;
    system.dayTime = data.dayTime;
    system.dayNumber = data.dayNumber;
    return system;
  }
}

export default DayNightSystem;
