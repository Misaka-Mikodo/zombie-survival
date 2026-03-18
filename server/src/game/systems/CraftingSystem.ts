// 合成系统
import { Item, Recipe, Inventory, InventorySlot } from '../../types/game';

export const RECIPE_DATA: Recipe[] = [
  // 工具
  {
    id: 'wooden_axe',
    name: '木斧',
    result: {
      id: 'axe',
      name: '木斧',
      type: 'tool',
      stackable: false,
      maxStack: 1,
      quantity: 1,
      description: '提高伐木效率',
    },
    ingredients: [
      { itemId: 'wood', quantity: 5 },
      { itemId: 'stone', quantity: 2 },
    ],
    craftingTime: 1000,
  },
  {
    id: 'stone_pickaxe',
    name: '石镐',
    result: {
      id: 'stone_pickaxe',
      name: '石镐',
      type: 'tool',
      stackable: false,
      maxStack: 1,
      quantity: 1,
      description: '提高采矿效率',
    },
    ingredients: [
      { itemId: 'wood', quantity: 3 },
      { itemId: 'stone', quantity: 5 },
    ],
    craftingTime: 1500,
  },
  // 武器
  {
    id: 'wooden_sword',
    name: '木剑',
    result: {
      id: 'wooden_sword',
      name: '木剑',
      type: 'weapon',
      stackable: false,
      maxStack: 1,
      quantity: 1,
      description: '基础武器，攻击+5',
      stats: { attack: 5 },
    },
    ingredients: [{ itemId: 'wood', quantity: 8 }],
    craftingTime: 2000,
  },
  {
    id: 'stone_sword',
    name: '石剑',
    result: {
      id: 'stone_sword',
      name: '石剑',
      type: 'weapon',
      stackable: false,
      maxStack: 1,
      quantity: 1,
      description: '进阶武器，攻击+10',
      stats: { attack: 10 },
    },
    ingredients: [
      { itemId: 'wood', quantity: 5 },
      { itemId: 'stone', quantity: 10 },
    ],
    craftingTime: 3000,
  },
  // 防具
  {
    id: 'wooden_armor',
    name: '木甲',
    result: {
      id: 'wooden_armor',
      name: '木甲',
      type: 'armor',
      stackable: false,
      maxStack: 1,
      quantity: 1,
      description: '基础防具，防御+5',
      stats: { defense: 5 },
    },
    ingredients: [{ itemId: 'wood', quantity: 15 }],
    craftingTime: 3000,
  },
  // 消耗品
  {
    id: 'bandage',
    name: '绷带',
    result: {
      id: 'bandage',
      name: '绷带',
      type: 'consumable',
      stackable: true,
      maxStack: 20,
      quantity: 1,
      description: '恢复30生命值',
      stats: { healthRestore: 30 },
    },
    ingredients: [
      { itemId: 'cloth', quantity: 2 },
      { itemId: 'herb', quantity: 1 },
    ],
    craftingTime: 1000,
  },
  {
    id: 'energy_drink',
    name: '能量饮料',
    result: {
      id: 'energy_drink',
      name: '能量饮料',
      type: 'consumable',
      stackable: true,
      maxStack: 10,
      quantity: 1,
      description: '恢复50体力',
      stats: { staminaRestore: 50 },
    },
    ingredients: [
      { itemId: 'food', quantity: 2 },
    ],
    craftingTime: 500,
  },
  // 建筑材料
  {
    id: 'wall_wooden',
    name: '木墙',
    result: {
      id: 'wall_wooden',
      name: '木墙',
      type: 'material',
      stackable: true,
      maxStack: 50,
      quantity: 1,
      description: '木质墙壁，血量100',
    },
    ingredients: [{ itemId: 'wood', quantity: 10 }],
    craftingTime: 500,
  },
  {
    id: 'wall_stone',
    name: '石墙',
    result: {
      id: 'wall_stone',
      name: '石墙',
      type: 'material',
      stackable: true,
      maxStack: 50,
      quantity: 1,
      description: '石质墙壁，血量300',
    },
    ingredients: [
      { itemId: 'stone', quantity: 15 },
      { itemId: 'wood', quantity: 5 },
    ],
    craftingTime: 1000,
  },
  // 照明
  {
    id: 'torch',
    name: '火把',
    result: {
      id: 'torch',
      name: '火把',
      type: 'tool',
      stackable: true,
      maxStack: 10,
      quantity: 1,
      description: '提供照明',
    },
    ingredients: [
      { itemId: 'wood', quantity: 2 },
    ],
    craftingTime: 300,
  },
];

export class CraftingSystem {
  private recipes: Map<string, Recipe> = new Map();
  
  constructor() {
    // 加载配方
    for (const recipe of RECIPE_DATA) {
      this.recipes.set(recipe.id, recipe);
    }
  }
  
  // 检查是否可以合成
  canCraft(inventory: Inventory, recipeId: string): boolean {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      return false;
    }
    
    // 检查材料是否足够
    for (const ingredient of recipe.ingredients) {
      const totalAmount = this.getItemAmount(inventory, ingredient.itemId);
      if (totalAmount < ingredient.quantity) {
        return false;
      }
    }
    
    // 检查背包空间
    const freeSlots = inventory.slots.filter((slot) => slot.item === null).length;
    const resultStackable = recipe.result.stackable;
    
    // 如果结果物品可以堆叠，检查已有空间中是否有空余
    if (resultStackable) {
      const existingSlot = inventory.slots.find(
        (slot) => slot.item?.id === recipe.result.id && 
                  slot.quantity < slot.item.maxStack
      );
      if (existingSlot) {
        return true;
      }
    }
    
    return freeSlots > 0;
  }
  
  // 执行合成
  craft(inventory: Inventory, recipeId: string): Item | null {
    const recipe = this.recipes.get(recipeId);
    if (!recipe || !this.canCraft(inventory, recipeId)) {
      return null;
    }
    
    // 消耗材料
    for (const ingredient of recipe.ingredients) {
      this.removeItems(inventory, ingredient.itemId, ingredient.quantity);
    }
    
    // 添加产物
    const result = { ...recipe.result };
    this.addItem(inventory, result);
    
    return result;
  }
  
  // 获取物品数量
  private getItemAmount(inventory: Inventory, itemId: string): number {
    return inventory.slots.reduce((total, slot) => {
      if (slot.item && slot.item.id === itemId) {
        return total + slot.quantity;
      }
      return total;
    }, 0);
  }
  
  // 移除物品
  private removeItems(inventory: Inventory, itemId: string, amount: number): void {
    let remaining = amount;
    
    for (const slot of inventory.slots) {
      if (remaining <= 0) break;
      
      if (slot.item && slot.item.id === itemId) {
        const removeAmount = Math.min(slot.quantity, remaining);
        slot.quantity -= removeAmount;
        remaining -= removeAmount;
        
        if (slot.quantity <= 0) {
          slot.item = null;
        }
      }
    }
  }
  
  // 添加物品
  private addItem(inventory: Inventory, item: Item): void {
    // 先尝试堆叠
    if (item.stackable) {
      for (const slot of inventory.slots) {
        if (slot.item && slot.item.id === item.id && slot.quantity < slot.item.maxStack) {
          const canAdd = Math.min(item.quantity, slot.item.maxStack - slot.quantity);
          slot.quantity += canAdd;
          item.quantity -= canAdd;
          
          if (item.quantity <= 0) {
            return;
          }
        }
      }
    }
    
    // 找到空位放置
    for (const slot of inventory.slots) {
      if (slot.item === null) {
        slot.item = { ...item };
        slot.quantity = item.quantity;
        return;
      }
    }
  }
  
  // 获取所有配方
  getAllRecipes(): Recipe[] {
    return Array.from(this.recipes.values());
  }
  
  // 获取可用的配方（基于背包材料）
  getAvailableRecipes(inventory: Inventory): Recipe[] {
    return this.getAllRecipes().filter((recipe) =>
      this.canCraft(inventory, recipe.id)
    );
  }
}

export default CraftingSystem;
// 更多合成配方
export const MORE_RECIPES = [
  { id: 'iron_sword', name: '铁剑', result: { id: 'iron_sword', name: '铁剑', type: 'weapon' as const, stackable: false, maxStack: 1, quantity: 1, stats: { attack: 20 } }, ingredients: [{ itemId: 'metal', quantity: 15 }], craftingTime: 5000 },
  { id: 'iron_armor', name: '铁甲', result: { id: 'iron_armor', name: '铁甲', type: 'armor' as const, stackable: false, maxStack: 1, quantity: 1, stats: { defense: 15 } }, ingredients: [{ itemId: 'metal', quantity: 25 }], craftingTime: 8000 },
  { id: 'health_potion', name: '生命药水', result: { id: 'health_potion', name: '生命药水', type: 'consumable' as const, stackable: true, maxStack: 10, quantity: 1, stats: { healthRestore: 50 } }, ingredients: [{ itemId: 'herb', quantity: 3 }], craftingTime: 2000 },
  { id: 'campfire', name: '篝火', result: { id: 'campfire', name: '篝火', type: 'tool' as const, stackable: true, maxStack: 5, quantity: 1 }, ingredients: [{ itemId: 'wood', quantity: 5 }], craftingTime: 1000 },
];
