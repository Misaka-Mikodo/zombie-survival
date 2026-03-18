// 资源收集系统
import { ResourceEntity, ResourceType, Vector2 } from '../../types/game';

export interface ResourceData {
  type: ResourceType;
  name: string;
  baseAmount: number;
  respawnTime: number;
  toolBonus: Record<string, number>;
}

export const RESOURCE_DATA: Record<ResourceType, ResourceData> = {
  wood: {
    type: 'wood',
    name: '木材',
    baseAmount: 5,
    respawnTime: 30000, // 30秒
    toolBonus: { axe: 2.0, stone_axe: 1.5 },
  },
  stone: {
    type: 'stone',
    name: '石材',
    baseAmount: 3,
    respawnTime: 45000,
    toolBonus: { pickaxe: 2.0, stone_pickaxe: 1.5 },
  },
  metal: {
    type: 'metal',
    name: '金属',
    baseAmount: 2,
    respawnTime: 60000,
    toolBonus: { pickaxe: 1.5, stone_pickaxe: 1.2 },
  },
  food: {
    type: 'food',
    name: '食物',
    baseAmount: 2,
    respawnTime: 20000,
    toolBonus: {},
  },
  herb: {
    type: 'herb',
    name: '草药',
    baseAmount: 2,
    respawnTime: 25000,
    toolBonus: {},
  },
  cloth: {
    type: 'cloth',
    name: '布料',
    baseAmount: 2,
    respawnTime: 30000,
    toolBonus: {},
  },
  electronic: {
    type: 'electronic',
    name: '电子元件',
    baseAmount: 1,
    respawnTime: 120000,
    toolBonus: {},
  },
};

export class ResourceSystem {
  private resources: Map<string, ResourceEntity> = new Map();
  private resourceIdCounter: number = 0;
  
  // 在地图上生成随机资源点
  spawnResources(
    mapWidth: number,
    mapHeight: number,
    resourceCounts: Partial<Record<ResourceType, number>> = {}
  ): void {
    const defaultCounts: Record<ResourceType, number> = {
      wood: 30,
      stone: 20,
      metal: 10,
      food: 25,
      herb: 15,
      cloth: 12,
      electronic: 5,
    };
    
    const counts = { ...defaultCounts, ...resourceCounts };
    
    for (const [type, count] of Object.entries(counts)) {
      for (let i = 0; i < count; i++) {
        const position = this.findValidSpawnPosition(mapWidth, mapHeight);
        this.spawnResource(type as ResourceType, position);
      }
    }
  }
  
  private findValidSpawnPosition(mapWidth: number, mapHeight: number): Vector2 {
    const padding = 100;
    return {
      x: padding + Math.random() * (mapWidth - padding * 2),
      y: padding + Math.random() * (mapHeight - padding * 2),
    };
  }
  
  private spawnResource(type: ResourceType, position: Vector2): void {
    const data = RESOURCE_DATA[type];
    const resource: ResourceEntity = {
      id: `resource_${this.resourceIdCounter++}`,
      type: 'resource',
      x: position.x,
      y: position.y,
      width: 32,
      height: 32,
      rotation: 0,
      resourceType: type,
      amount: data.baseAmount,
      respawnTime: 0,
    };
    
    this.resources.set(resource.id, resource);
  }
  
  // 收集资源
  harvest(
    resourceId: string,
    toolId?: string
  ): { type: ResourceType; amount: number } | null {
    const resource = this.resources.get(resourceId);
    if (!resource || resource.amount <= 0) {
      return null;
    }
    
    const data = RESOURCE_DATA[resource.resourceType];
    let amount = data.baseAmount;
    
    // 工具加成
    if (toolId && data.toolBonus[toolId]) {
      amount = Math.floor(amount * data.toolBonus[toolId]);
    }
    
    resource.amount -= amount;
    
    // 如果资源耗尽，设置重生时间
    if (resource.amount <= 0) {
      resource.respawnTime = Date.now() + data.respawnTime;
    }
    
    return {
      type: resource.resourceType,
      amount,
    };
  }
  
  // 更新资源（处理重生）
  update(): void {
    const now = Date.now();
    
    for (const resource of this.resources.values()) {
      if (resource.amount <= 0 && resource.respawnTime > 0) {
        if (now >= resource.respawnTime) {
          const data = RESOURCE_DATA[resource.resourceType];
          resource.amount = data.baseAmount;
          resource.respawnTime = 0;
        }
      }
    }
  }
  
  // 获取所有资源实体
  getResources(): ResourceEntity[] {
    return Array.from(this.resources.values());
  }
  
  // 获取指定区域内的资源
  getResourcesInArea(center: Vector2, radius: number): ResourceEntity[] {
    return Array.from(this.resources.values()).filter((r) => {
      const dx = r.x - center.x;
      const dy = r.y - center.y;
      return Math.sqrt(dx * dx + dy * dy) <= radius;
    });
  }
  
  // 序列化
  serialize(): object {
    return {
      resources: Array.from(this.resources.values()),
    };
  }
}

export default ResourceSystem;
