// 僵尸AI与寻路系统
import { ZombieEntity, ZombieType, Vector2, PlayerEntity, BuildingEntity } from '../../types/game';

export const ZOMBIE_DATA: Record<ZombieType, {
  health: number;
  speed: number;
  attack: number;
  attackRange: number;
  detectionRadius: number;
  attackCooldown: number;
}> = {
  normal: {
    health: 50,
    speed: 60,
    attack: 5,
    attackRange: 30,
    detectionRadius: 200,
    attackCooldown: 1000,
  },
  fast: {
    health: 30,
    speed: 120,
    attack: 3,
    attackRange: 25,
    detectionRadius: 180,
    attackCooldown: 800,
  },
  giant: {
    health: 200,
    speed: 30,
    attack: 15,
    attackRange: 50,
    detectionRadius: 300,
    attackCooldown: 2000,
  },
  crawler: {
    health: 40,
    speed: 90,
    attack: 8,
    attackRange: 20,
    detectionRadius: 150,
    attackCooldown: 600,
  },
};

interface PathNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

export class ZombieAI {
  private zombies: Map<string, ZombieEntity> = new Map();
  private players: Map<string, PlayerEntity> = new Map();
  private buildings: Map<string, BuildingEntity> = new Map();
  private mapWidth: number = 2000;
  private mapHeight: number = 2000;
  private zombieIdCounter: number = 0;
  
  // 寻路网格大小
  private readonly GRID_SIZE = 40;
  
  setMapSize(width: number, height: number): void {
    this.mapWidth = width;
    this.mapHeight = height;
  }
  
  update(deltaTime: number): void {
    for (const zombie of this.zombies.values()) {
      this.updateZombie(zombie, deltaTime);
    }
  }
  
  private updateZombie(zombie: ZombieEntity, deltaTime: number): void {
    const data = ZOMBIE_DATA[zombie.zombieType];
    
    // 查找目标
    let target = this.findTarget(zombie);
    
    if (target) {
      // 检查是否在攻击范围内
      const distance = this.getDistance(zombie, target);
      
      if (distance <= data.attackRange) {
        // 攻击
        zombie.state = 'attacking';
        this.attack(zombie, target);
      } else {
        // 移动向目标
        zombie.state = 'walking';
        const direction = this.getDirection(zombie, target);
        
        // 使用简化寻路（直线移动 + 避开障碍）
        zombie.x += direction.x * data.speed * deltaTime / 1000;
        zombie.y += direction.y * data.speed * deltaTime / 1000;
        
        // 边界检查
        zombie.x = Math.max(0, Math.min(this.mapWidth - zombie.width, zombie.x));
        zombie.y = Math.max(0, Math.min(this.mapHeight - zombie.height, zombie.y));
      }
    } else {
      zombie.state = 'idle';
    }
  }
  
  private findTarget(zombie: ZombieEntity): { x: number; y: number } | null {
    const data = ZOMBIE_DATA[zombie.zombieType];
    let closestTarget: { x: number; y: number; distance: number } | null = null;
    
    // 优先攻击玩家
    for (const player of this.players.values()) {
      const distance = this.getDistance(zombie, player);
      
      if (distance <= data.detectionRadius) {
        if (!closestTarget || distance < closestTarget.distance) {
          closestTarget = { x: player.x, y: player.y, distance };
        }
      }
    }
    
    // 如果没有玩家，攻击建筑物
    if (!closestTarget) {
      for (const building of this.buildings.values()) {
        const distance = this.getDistance(zombie, building);
        
        if (distance <= data.detectionRadius * 1.5) {
          if (!closestTarget || distance < closestTarget.distance) {
            closestTarget = { x: building.x, y: building.y, distance };
          }
        }
      }
    }
    
    return closestTarget;
  }
  
  private getDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  private getDirection(from: { x: number; y: number }, to: { x: number; y: number }): Vector2 {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) {
      return { x: 0, y: 0 };
    }
    
    return { x: dx / distance, y: dy / distance };
  }
  
  private attack(zombie: ZombieEntity, target: { x: number; y: number; health?: number }): void {
    const data = ZOMBIE_DATA[zombie.zombieType];
    const now = Date.now();
    
    // 检查冷却
    const lastAttack = (zombie as any).lastAttackTime || 0;
    if (now - lastAttack < data.attackCooldown) {
      return;
    }
    
    (zombie as any).lastAttackTime = now;
    
    // 造成伤害（实际伤害逻辑在战斗系统中处理）
    if (target.health !== undefined) {
      target.health -= data.attack;
    }
  }
  
  // 生成僵尸
  spawnZombie(type: ZombieType, position: Vector2): ZombieEntity {
    const data = ZOMBIE_DATA[type];
    
    const zombie: ZombieEntity = {
      id: `zombie_${this.zombieIdCounter++}`,
      type: 'zombie',
      x: position.x,
      y: position.y,
      width: 32,
      height: 32,
      rotation: 0,
      zombieType: type,
      health: data.health,
      maxHealth: data.health,
      speed: data.speed,
      attack: data.attack,
      state: 'idle',
    };
    
    this.zombies.set(zombie.id, zombie);
    return zombie;
  }
  
  // 生成僵尸波次
  spawnWave(waveNumber: number, mapWidth: number, mapHeight: number): void {
    const baseCount = 5 + waveNumber * 3;
    
    for (let i = 0; i < baseCount; i++) {
      // 随机从地图边缘生成
      const side = Math.floor(Math.random() * 4);
      let x: number, y: number;
      
      switch (side) {
        case 0: // 上
          x = Math.random() * mapWidth;
          y = -50;
          break;
        case 1: // 右
          x = mapWidth + 50;
          y = Math.random() * mapHeight;
          break;
        case 2: // 下
          x = Math.random() * mapWidth;
          y = mapHeight + 50;
          break;
        default: // 左
          x = -50;
          y = Math.random() * mapHeight;
      }
      
      // 随机类型
      const rand = Math.random();
      let type: ZombieType = 'normal';
      
      if (rand > 0.9) {
        type = 'giant';
      } else if (rand > 0.75) {
        type = 'fast';
      } else if (rand > 0.65) {
        type = 'crawler';
      }
      
      this.spawnZombie(type, { x, y });
    }
  }
  
  // 移除僵尸
  removeZombie(id: string): void {
    this.zombies.delete(id);
  }
  
  // 获取所有僵尸
  getZombies(): ZombieEntity[] {
    return Array.from(this.zombies.values());
  }
  
  // 更新玩家数据
  setPlayers(players: Map<string, PlayerEntity>): void {
    this.players = players;
  }
  
  // 更新建筑物数据
  setBuildings(buildings: Map<string, BuildingEntity>): void {
    this.buildings = buildings;
  }
  
  // 造成伤害给僵尸
  damageZombie(zombieId: string, damage: number): boolean {
    const zombie = this.zombies.get(zombieId);
    if (!zombie) return false;
    
    zombie.health -= damage;
    
    if (zombie.health <= 0) {
      this.removeZombie(zombieId);
      return true; // 僵尸死亡
    }
    
    return false;
  }
}

export default ZombieAI;
