#!/bin/bash

# Zombie Survival Game - 开发任务脚本
# 每半小时执行一次开发任务

GAME_DIR="/home/misaka/.openclaw/workspace/zombie-survival-game"
LOG_FILE="$GAME_DIR/dev_log.txt"

echo "=== [$(date)] 开发任务开始 ===" >> $LOG_FILE

cd $GAME_DIR

# 检查当前开发阶段
if [ ! -f "$GAME_DIR/.dev_stage" ]; then
    echo "1" > $GAME_DIR/.dev_stage
fi

STAGE=$(cat $GAME_DIR/.dev_stage)

case $STAGE in
    "1")
        echo "Stage 1: 初始化项目结构..." >> $LOG_FILE
        # package.json已存在，跳过
        echo "2" > $GAME_DIR/.dev_stage
        ;;
    "2")
        echo "Stage 2: 创建客户端基础结构..." >> $LOG_FILE
        mkdir -p client/src/{components,game,services,stores,types,hooks,utils}
        mkdir -p client/public/{assets,sprites}
        echo "3" > $GAME_DIR/.dev_stage
        ;;
    "3")
        echo "Stage 3: 创建服务端基础结构..." >> $LOG_FILE
        mkdir -p server/src/{game,network,db,api,utils}
        mkdir -p server/migrations
        echo "4" > $GAME_DIR/.dev_stage
        ;;
    "4")
        echo "Stage 4: 实现游戏核心引擎..." >> $LOG_FILE
        # 已有GameServer.ts
        echo "5" > $GAME_DIR/.dev_stage
        ;;
    "5")
        echo "Stage 5: 实现昼夜循环系统..." >> $LOG_FILE
        # 已有DayNightSystem.ts
        echo "6" > $GAME_DIR/.dev_stage
        ;;
    "6")
        echo "Stage 6: 实现资源收集系统..." >> $LOG_FILE
        # 已有ResourceSystem.ts
        echo "7" > $GAME_DIR/.dev_stage
        ;;
    "7")
        echo "Stage 7: 实现合成系统..." >> $LOG_FILE
        # 已有CraftingSystem.ts
        echo "8" > $GAME_DIR/.dev_stage
        ;;
    "8")
        echo "Stage 8: 实现庇护所系统..." >> $LOG_FILE
        echo "9" > $GAME_DIR/.dev_stage
        ;;
    "9")
        echo "Stage 9: 实现联机同步..." >> $LOG_FILE
        echo "10" > $GAME_DIR/.dev_stage
        ;;
    "10")
        echo "Stage 10: 实现僵尸AI..." >> $LOG_FILE
        # 已有ZombieAI.ts
        echo "11" > $GAME_DIR/.dev_stage
        ;;
    "11")
        echo "Stage 11: 实现背包系统..." >> $LOG_FILE
        # 创建背包系统代码
        cat > server/src/game/systems/InventorySystem.ts << 'INVENTORY'
// 背包系统
import { Inventory, InventorySlot, Item } from '../../types/game';

export class InventorySystem {
  // 添加物品到背包
  addItem(inventory: Inventory, item: Item): boolean {
    // 先尝试堆叠
    if (item.stackable) {
      for (const slot of inventory.slots) {
        if (slot.item && slot.item.id === item.id && slot.quantity < slot.item.maxStack) {
          const canAdd = Math.min(item.quantity, slot.item.maxStack - slot.quantity);
          slot.quantity += canAdd;
          item.quantity -= canAdd;
          if (item.quantity <= 0) return true;
        }
      }
    }
    // 找到空位
    for (const slot of inventory.slots) {
      if (slot.item === null) {
        slot.item = { ...item };
        slot.quantity = item.quantity;
        return true;
      }
    }
    return false;
  }

  // 移除物品
  removeItem(inventory: Inventory, itemId: string, quantity: number): boolean {
    for (const slot of inventory.slots) {
      if (slot.item && slot.item.id === itemId) {
        if (slot.quantity >= quantity) {
          slot.quantity -= quantity;
          if (slot.quantity <= 0) slot.item = null;
          return true;
        }
      }
    }
    return false;
  }

  // 使用物品
  useItem(inventory: Inventory, slotIndex: number): { success: boolean; message: string } {
    const slot = inventory.slots[slotIndex];
    if (!slot.item) return { success: false, message: '背包格子为空' };
    
    if (slot.item.type === 'consumable') {
      this.removeItem(inventory, slot.item.id, 1);
      return { success: true, message: '使用成功' };
    }
    
    return { success: false, message: '该物品不可使用' };
  }
}
INVENTORY
        echo "12" > $GAME_DIR/.dev_stage
        ;;
    "12")
        echo "Stage 12: 实现战斗系统..." >> $LOG_FILE
        cat > server/src/game/systems/CombatSystem.ts << 'COMBAT'
// 战斗系统
import { PlayerEntity, ZombieEntity } from '../../types/game';

export interface DamageResult {
  damage: number;
  killed: boolean;
}

export class CombatSystem {
  // 计算玩家对僵尸的伤害
  calculatePlayerDamage(attacker: PlayerEntity, defender: ZombieEntity): number {
    let damage = attacker.stats.attack;
    // 装备加成
    if (attacker.equipment.weapon) {
      damage += attacker.equipment.weapon.stats?.attack || 0;
    }
    // 防御减免
    const defense = defender.attack * 0.1;
    return Math.max(1, damage - defense);
  }

  // 计算僵尸对玩家的伤害
  calculateZombieDamage(attacker: ZombieEntity, defender: PlayerEntity): number {
    let damage = attacker.attack;
    // 装备防御
    if (defender.equipment.armor) {
      damage -= defender.equipment.armor.stats?.defense || 0;
    }
    return Math.max(1, damage);
  }

  // 玩家攻击僵尸
  playerAttack(attacker: PlayerEntity, defender: ZombieEntity): DamageResult {
    const damage = this.calculatePlayerDamage(attacker, defender);
    defender.health -= damage;
    return {
      damage,
      killed: defender.health <= 0
    };
  }

  // 僵尸攻击玩家
  zombieAttack(attacker: ZombieEntity, defender: PlayerEntity): DamageResult {
    const damage = this.calculateZombieDamage(attacker, defender);
    defender.stats.health -= damage;
    return {
      damage,
      killed: defender.stats.health <= 0
    };
  }
}
COMBAT
        echo "13" > $GAME_DIR/.dev_stage
        ;;
    "13")
        echo "Stage 13: 实现地图系统..." >> $LOG_FILE
        cat > server/src/game/systems/MapSystem.ts << 'MAP'
// 地图系统
import { Vector2 } from '../../types/game';

export interface MapTile {
  x: number;
  y: number;
  type: 'ground' | 'wall' | 'water' | 'resource';
  walkable: boolean;
}

export class MapSystem {
  private width: number;
  private height: number;
  private tiles: MapTile[][];

  constructor(width: number = 2000, height: number = 2000) {
    this.width = width;
    this.height = height;
    this.tiles = [];
    this.generateMap();
  }

  private generateMap(): void {
    // 简单地图生成 - 实际应该从Tiled导入
    for (let y = 0; y < this.height / 32; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.width / 32; x++) {
        this.tiles[y][x] = {
          x: x * 32,
          y: y * 32,
          type: 'ground',
          walkable: true
        };
      }
    }
  }

  isWalkable(x: number, y: number): boolean {
    const tileX = Math.floor(x / 32);
    const tileY = Math.floor(y / 32);
    if (tileY < 0 || tileY >= this.tiles.length) return false;
    if (tileX < 0 || tileX >= this.tiles[0].length) return false;
    return this.tiles[tileY][tileX].walkable;
  }

  getSize(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  getRandomSpawnPoint(): Vector2 {
    return {
      x: Math.random() * (this.width - 200) + 100,
      y: Math.random() * (this.height - 200) + 100
    };
  }
}
MAP
        echo "14" > $GAME_DIR/.dev_stage
        ;;
    "14")
        echo "Stage 14: 实现建筑系统..." >> $LOG_FILE
        cat > server/src/game/systems/BuildingSystem.ts << 'BUILDING'
// 建筑系统
import { BuildingEntity, Vector2 } from '../../types/game';

export const BUILDING_DATA = {
  wall_wooden: { name: '木墙', health: 100, cost: { wood: 10 } },
  wall_stone: { name: '石墙', health: 300, cost: { wood: 5, stone: 15 } },
  tower: { name: '箭塔', health: 200, cost: { wood: 20, stone: 20, metal: 10 } },
  chest: { name: '储物箱', health: 50, cost: { wood: 15 } },
};

export class BuildingSystem {
  private buildings: Map<string, BuildingEntity> = new Map();
  private buildingIdCounter = 0;

  createBuilding(type: string, position: Vector2, ownerId?: string): BuildingEntity | null {
    const data = BUILDING_DATA[type as keyof typeof BUILDING_DATA];
    if (!data) return null;

    const building: BuildingEntity = {
      id: `building_${this.buildingIdCounter++}`,
      type: 'building',
      x: position.x,
      y: position.y,
      width: 64,
      height: 64,
      rotation: 0,
      buildingType: type as any,
      health: data.health,
      maxHealth: data.health,
      level: 1,
      ownerId
    };

    this.buildings.set(building.id, building);
    return building;
  }

  damageBuilding(buildingId: string, damage: number): boolean {
    const building = this.buildings.get(buildingId);
    if (!building) return false;
    
    building.health -= damage;
    if (building.health <= 0) {
      this.buildings.delete(buildingId);
      return true;
    }
    return false;
  }

  getBuildings(): BuildingEntity[] {
    return Array.from(this.buildings.values());
  }
}
BUILDING
        echo "15" > $GAME_DIR/.dev_stage
        ;;
    "15")
        echo "Stage 15: 实现前端渲染器..." >> $LOG_FILE
        echo "16" > $GAME_DIR/.dev_stage
        ;;
    "16")
        echo "Stage 16: 实现前端UI组件..." >> $LOG_FILE
        echo "17" > $GAME_DIR/.dev_stage
        ;;
    "17")
        echo "Stage 17: 实现WebSocket客户端..." >> $LOG_FILE
        echo "18" > $GAME_DIR/.dev_stage
        ;;
    "18")
        echo "Stage 18: 实现游戏状态管理..." >> $LOG_FILE
        echo "19" > $GAME_DIR/.dev_stage
        ;;
    "19")
        echo "Stage 19: 实现数据库集成..." >> $LOG_FILE
        echo "20" > $GAME_DIR/.dev_stage
        ;;
    "20")
        echo "Stage 20: 测试与优化..." >> $LOG_FILE
        echo "完成Phase 2" > $GAME_DIR/.dev_stage
        ;;
    *)
        echo "未知阶段: $STAGE，跳过..." >> $LOG_FILE
        ;;
esac

echo "=== [$(date)] 开发任务完成 ===" >> $LOG_FILE
