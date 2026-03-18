// Socket.io 客户端
import { io, Socket } from 'socket.io-client';

export class GameSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  connect(url?: string): void {
    // 使用环境变量或默认URL
    const serverUrl = url || import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    this.socket = io(serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
    });
  }

  // 发送消息
  emit(event: string, data: any): void {
    this.socket?.emit(event, data);
  }

  // 注册事件监听
  on(event: string, callback: (data: any) => void): void {
    this.socket?.on(event, callback);
  }

  // 移除事件监听
  off(event: string, callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  // 加入游戏
  join(name: string): void {
    this.emit('join', { name });
  }

  // 移动
  move(x: number, y: number): void {
    this.emit('move', { x, y });
  }

  // 收集资源
  harvest(resourceId: string, toolId?: string): void {
    this.emit('harvest', { resourceId, toolId });
  }

  // 合成
  craft(recipeId: string): void {
    this.emit('craft', { recipeId });
  }

  // 攻击
  attack(targetId: string): void {
    this.emit('attack', { targetId });
  }

  // 断开连接
  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}
