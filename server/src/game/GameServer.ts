// 游戏服务器主类
import { Server } from 'socket.io';
import { GameState, DayPhase, PlayerEntity, Inventory } from '../../types/game';
import { DayNightSystem } from './systems/DayNightSystem';
import { ResourceSystem } from './systems/ResourceSystem';
import { CraftingSystem } from './systems/CraftingSystem';
import { ZombieAI } from './ai/ZombieAI';

export class GameServer {
  private io: Server;
  private port: number;
  private running: boolean = false;
  private tickRate: number = 30;
  private updateInterval: number = 1000 / this.tickRate;
  
  // 游戏系统
  private dayNight: DayNightSystem;
  private resources: ResourceSystem;
  private crafting: CraftingSystem;
  private zombieAI: ZombieAI;
  
  // 游戏状态
  private state: GameState;
  private players: Map<string, PlayerEntity> = new Map();
  
  // 地图设置
  private readonly MAP_WIDTH = 2000;
  private readonly MAP_HEIGHT = 2000;
  
  constructor(io: Server, port: number = 3001) {
    this.io = io;
    this.port = port;
    
    // 初始化系统
    this.dayNight = new DayNightSystem();
    this.resources = new ResourceSystem();
    this.crafting = new CraftingSystem();
    this.zombieAI = new ZombieAI();
    
    // 初始化状态
    this.state = {
      tick: 0,
      phase: 'day',
      dayTime: 0,
      dayNumber: 1,
      players: new Map(),
      zombies: new Map(),
      items: new Map(),
      buildings: new Map(),
      resources: new Map(),
    };
    
    // 初始化昼夜循环回调
    this.setupDayNightCallbacks();
    
    // 生成资源
    this.resources.spawnResources(this.MAP_WIDTH, this.MAP_HEIGHT);
  }
  
  private setupDayNightCallbacks(): void {
    this.dayNight.setOnNightStart(() => {
      // 夜晚开始，生成僵尸波次
      const wave = this.dayNight.getDayNumber();
      this.zombieAI.spawnWave(wave, this.MAP_WIDTH, this.MAP_HEIGHT);
      this.io.emit('nightStart', { wave });
    });
    
    this.dayNight.setOnDayStart(() => {
      // 白天开始，清理僵尸
      this.io.emit('dayStart', { day: this.dayNight.getDayNumber() });
    });
  }
  
  start(): void {
    if (this.running) return;
    
    this.running = true;
    console.log(`[GameServer] Starting on port ${this.port}`);
    
    // 设置定时更新
    setInterval(() => this.gameLoop(), this.updateInterval);
    
    // 设置Socket.io处理器
    this.setupSocketHandlers();
  }
  
  private gameLoop(): void {
    const deltaTime = this.updateInterval;
    
    // 1. 更新昼夜系统
    this.dayNight.update(deltaTime);
    
    // 2. 更新资源系统
    this.resources.update();
    
    // 3. 更新僵尸AI
    this.zombieAI.setPlayers(this.players);
    this.zombieAI.update(deltaTime);
    
    // 4. 更新状态
    this.state.tick++;
    this.state.phase = this.dayNight.getPhase();
    this.state.dayTime = this.dayNight.getGameHour();
    this.state.dayNumber = this.dayNight.getDayNumber();
    this.state.players = this.players;
    this.state.zombies = new Map(
      this.zombieAI.getZombies().map((z) => [z.id, z])
    );
    
    // 5. 广播世界状态
    this.broadcastState();
  }
  
  private broadcastState(): void {
    // 每秒广播一次完整状态
    if (this.state.tick % this.tickRate === 0) {
      this.io.emit('worldState', {
        tick: this.state.tick,
        phase: this.state.phase,
        dayTime: this.state.dayTime,
        dayNumber: this.state.dayNumber,
        players: Array.from(this.players.values()).map((p) => ({
          id: p.id,
          name: p.name,
          x: p.x,
          y: p.y,
          health: p.stats.health,
          level: p.level,
        })),
        zombies: Array.from(this.state.zombies.values()).map((z) => ({
          id: z.id,
          type: z.zombieType,
          x: z.x,
          y: z.y,
          health: z.health,
          state: z.state,
        })),
        resources: this.resources.getResources().map((r) => ({
          id: r.id,
          type: r.resourceType,
          x: r.x,
          y: r.y,
          amount: r.amount,
        })),
      });
    }
  }
  
  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`[GameServer] Client connected: ${socket.id}`);
      
      // 玩家加入
      socket.on('join', (data: { name: string }) => {
        this.handlePlayerJoin(socket, data.name);
      });
      
      // 玩家移动
      socket.on('move', (data: { x: number; y: number }) => {
        this.handlePlayerMove(socket.id, data);
      });
      
      // 收集资源
      socket.on('harvest', (data: { resourceId: string; toolId?: string }) => {
        this.handleHarvest(socket.id, data);
      });
      
      // 合成
      socket.on('craft', (data: { recipeId: string }) => {
        this.handleCraft(socket.id, data);
      });
      
      // 攻击
      socket.on('attack', (data: { targetId: string }) => {
        this.handleAttack(socket.id, data);
      });
      
      // 玩家断开
      socket.on('disconnect', () => {
        this.handlePlayerLeave(socket.id);
      });
    });
  }
  
  private handlePlayerJoin(socketId: string, name: string): void {
    const player: PlayerEntity = {
      id: socketId,
      type: 'player',
      name,
      x: this.MAP_WIDTH / 2,
      y: this.MAP_HEIGHT / 2,
      width: 32,
      height: 32,
      rotation: 0,
      level: 1,
      experience: 0,
      stats: {
        health: 100,
        maxHealth: 100,
        stamina: 100,
        maxStamina: 100,
        loadCapacity: 50,
        attack: 5,
        defense: 0,
      },
      inventory: {
        slots: Array(20).fill(null).map(() => ({ item: null, quantity: 0 })),
        capacity: 20,
        gold: 100,
      },
      equipment: {
        weapon: null,
        armor: null,
        accessory: null,
      },
    };
    
    this.players.set(socketId, player);
    
    // 发送欢迎消息
    this.io.to(socketId).emit('joined', {
      playerId: socketId,
      player,
      mapWidth: this.MAP_WIDTH,
      mapHeight: this.MAP_HEIGHT,
    });
    
    console.log(`[GameServer] Player joined: ${name} (${socketId})`);
  }
  
  private handlePlayerMove(socketId: string, data: { x: number; y: number }): void {
    const player = this.players.get(socketId);
    if (!player) return;
    
    // 边界检查
    player.x = Math.max(0, Math.min(this.MAP_WIDTH - player.width, data.x));
    player.y = Math.max(0, Math.min(this.MAP_HEIGHT - player.height, data.y));
  }
  
  private handleHarvest(socketId: string, data: { resourceId: string; toolId?: string }): void {
    const player = this.players.get(socketId);
    if (!player) return;
    
    const result = this.resources.harvest(data.resourceId, data.toolId);
    
    if (result) {
      // 添加到背包
      this.addItemToInventory(player.inventory, result.type, result.amount);
      
      this.io.to(socketId).emit('harvestResult', {
        success: true,
        resource: result.type,
        amount: result.amount,
      });
    }
  }
  
  private addItemToInventory(inventory: Inventory, itemType: string, amount: number): void {
    // 简化版本：直接添加到背包
    for (const slot of inventory.slots) {
      if (slot.item === null) {
        slot.item = {
          id: itemType,
          name: itemType,
          type: 'material',
          stackable: true,
          maxStack: 99,
          quantity: amount,
        };
        slot.quantity = amount;
        break;
      }
    }
  }
  
  private handleCraft(socketId: string, data: { recipeId: string }): void {
    const player = this.players.get(socketId);
    if (!player) return;
    
    const result = this.crafting.craft(player.inventory, data.recipeId);
    
    if (result) {
      this.io.to(socketId).emit('craftResult', {
        success: true,
        item: result,
      });
    } else {
      this.io.to(socketId).emit('craftResult', {
        success: false,
        message: '材料不足或背包已满',
      });
    }
  }
  
  private handleAttack(socketId: string, data: { targetId: string }): void {
    const player = this.players.get(socketId);
    if (!player) return;
    
    // 查找目标僵尸
    const zombie = this.state.zombies.get(data.targetId);
    if (!zombie) return;
    
    const damage = player.stats.attack;
    const killed = this.zombieAI.damageZombie(data.targetId, damage);
    
    // 广播攻击结果
    this.io.emit('attackResult', {
      attackerId: socketId,
      targetId: data.targetId,
      damage,
      killed,
    });
  }
  
  private handlePlayerLeave(socketId: string): void {
    const player = this.players.get(socketId);
    if (player) {
      console.log(`[GameServer] Player left: ${player.name}`);
      this.players.delete(socketId);
    }
  }
}

export default GameServer;
