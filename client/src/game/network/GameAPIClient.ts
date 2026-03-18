// 游戏API客户端 - 使用REST轮询
const API_URL = import.meta.env.VITE_API_URL || '';

export class GameAPIClient {
  private playerId: string | null = null;
  private pollInterval: number | null = null;
  private stateCallback: ((state: any) => void) | null = null;
  
  // 加入游戏
  async join(name: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/game`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'join', name })
    });
    const data = await response.json();
    this.playerId = data.playerId;
    return data;
  }
  
  // 获取游戏状态 (轮询)
  async getState(x?: number, y?: number): Promise<any> {
    let url = `${API_URL}/api/game?`;
    if (this.playerId) url += `playerId=${this.playerId}`;
    if (x !== undefined) url += `&x=${x}`;
    if (y !== undefined) url += `&y=${y}`;
    
    const response = await fetch(url);
    return response.json();
  }
  
  // 移动
  async move(x: number, y: number): Promise<any> {
    return this.getState(x, y);
  }
  
  // 收集资源
  async harvest(resourceId: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/game`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'harvest', 
        playerId: this.playerId, 
        resourceId 
      })
    });
    return response.json();
  }
  
  // 开始轮询
  startPolling(callback: (state: any) => void, interval: number = 1000) {
    this.stateCallback = callback;
    this.pollInterval = window.setInterval(async () => {
      const state = await this.getState();
      if (this.stateCallback) {
        this.stateCallback(state);
      }
    }, interval);
  }
  
  // 停止轮询
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
  
  getPlayerId(): string | null {
    return this.playerId;
  }
}
