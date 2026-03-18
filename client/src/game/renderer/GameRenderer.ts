// 游戏渲染器 - 使用Canvas 2D
export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private cameraX: number = 0;
  private cameraY: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  // 设置相机位置
  setCamera(x: number, y: number): void {
    this.cameraX = x - this.width / 2;
    this.cameraY = y - this.height / 2;
  }

  // 清空画布
  clear(): void {
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  // 绘制玩家
  drawPlayer(x: number, y: number, name: string, health: number): void {
    const screenX = x - this.cameraX;
    const screenY = y - this.cameraY;
    
    // 玩家身体
    this.ctx.fillStyle = '#4ade80';
    this.ctx.beginPath();
    this.ctx.arc(screenX, screenY, 16, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 血条
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(screenX - 20, screenY - 30, 40 * (health / 100), 4);
    
    // 名字
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(name, screenX, screenY - 35);
  }

  // 绘制僵尸
  drawZombie(x: number, y: number, type: string, health: number): void {
    const screenX = x - this.cameraX;
    const screenY = y - this.cameraY;
    
    const colors: Record<string, string> = {
      normal: '#84cc16',
      fast: '#f59e0b',
      giant: '#dc2626',
      crawler: '#8b5cf6'
    };
    
    this.ctx.fillStyle = colors[type] || '#84cc16';
    this.ctx.beginPath();
    this.ctx.arc(screenX, screenY, type === 'giant' ? 24 : 14, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 血条
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(screenX - 15, screenY - 25, 30 * (health / 100), 3);
  }

  // 绘制资源
  drawResource(x: number, y: number, type: string): void {
    const screenX = x - this.cameraX;
    const screenY = y - this.cameraY;
    
    const colors: Record<string, string> = {
      wood: '#92400e',
      stone: '#6b7280',
      metal: '#475569',
      food: '#dc2626',
      herb: '#16a34a'
    };
    
    this.ctx.fillStyle = colors[type] || '#888';
    this.ctx.fillRect(screenX - 10, screenY - 10, 20, 20);
  }

  // 绘制建筑
  drawBuilding(x: number, y: number, type: string, health: number): void {
    const screenX = x - this.cameraX;
    const screenY = y - this.cameraY;
    
    this.ctx.fillStyle = '#78716c';
    this.ctx.fillRect(screenX - 32, screenY - 32, 64, 64);
    
    // 血条
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(screenX - 30, screenY - 45, 60 * (health / 100), 4);
  }

  // 绘制地图网格
  drawGrid(): void {
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;
    
    const gridSize = 32;
    const startX = -this.cameraX % gridSize;
    const startY = -this.cameraY % gridSize;
    
    for (let x = startX; x < this.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    
    for (let y = startY; y < this.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  // 渲染帧
  render(state: any): void {
    this.clear();
    this.drawGrid();
    
    // 绘制资源
    for (const r of state.resources || []) {
      this.drawResource(r.x, r.y, r.type);
    }
    
    // 绘制建筑
    for (const b of state.buildings || []) {
      this.drawBuilding(b.x, b.y, b.type, b.health);
    }
    
    // 绘制僵尸
    for (const z of state.zombies || []) {
      this.drawZombie(z.x, z.y, z.type, z.health);
    }
    
    // 绘制玩家
    for (const p of state.players || []) {
      this.drawPlayer(p.x, p.y, p.name, p.health);
    }
  }
}
