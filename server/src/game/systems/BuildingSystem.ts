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
