// 游戏类型定义
export interface Vector2 {
  x: number;
  y: number;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  loadCapacity: number;
  attack: number;
  defense: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type EntityType = 'player' | 'zombie' | 'item' | 'building' | 'resource';

export type ItemType = 'material' | 'weapon' | 'armor' | 'consumable' | 'tool';

export type ResourceType = 'wood' | 'stone' | 'metal' | 'food' | 'herb' | 'cloth' | 'electronic';

export type ZombieType = 'normal' | 'fast' | 'giant' | 'crawler';

export type DayPhase = 'day' | 'twilight' | 'night';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  stackable: boolean;
  maxStack: number;
  quantity: number;
  description?: string;
  stats?: {
    attack?: number;
    defense?: number;
    healthRestore?: number;
    staminaRestore?: number;
  };
}

export interface InventorySlot {
  item: Item | null;
  quantity: number;
}

export interface Inventory {
  slots: InventorySlot[];
  capacity: number;
  gold: number;
}

export interface Equipment {
  weapon: Item | null;
  armor: Item | null;
  accessory: Item | null;
}

export interface BaseEntity {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface PlayerEntity extends BaseEntity {
  type: 'player';
  name: string;
  level: number;
  experience: number;
  stats: PlayerStats;
  inventory: Inventory;
  equipment: Equipment;
}

export interface ZombieEntity extends BaseEntity {
  type: 'zombie';
  zombieType: ZombieType;
  health: number;
  maxHealth: number;
  speed: number;
  attack: number;
  targetId?: string;
}

export interface ItemEntity extends BaseEntity {
  type: 'item';
  item: Item;
}

export interface BuildingEntity extends BaseEntity {
  type: 'building';
  buildingType: 'wall' | 'tower' | 'trap' | 'chest';
  health: number;
  maxHealth: number;
  level: number;
  ownerId?: string;
}

export interface ResourceEntity extends BaseEntity {
  type: 'resource';
  resourceType: ResourceType;
  amount: number;
  respawnTime: number;
}

export type GameEntity = PlayerEntity | ZombieEntity | ItemEntity | BuildingEntity | ResourceEntity;

export interface GameState {
  tick: number;
  phase: DayPhase;
  dayTime: number;
  dayNumber: number;
  players: Map<string, PlayerEntity>;
  zombies: Map<string, ZombieEntity>;
  items: Map<string, ItemEntity>;
  buildings: Map<string, BuildingEntity>;
  resources: Map<string, ResourceEntity>;
}

export interface Recipe {
  id: string;
  name: string;
  result: Item;
  ingredients: Array<{ itemId: string; quantity: number }>;
  craftingTime: number;
  requiredStation?: string;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type: 'global' | 'team' | 'system';
}
