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
