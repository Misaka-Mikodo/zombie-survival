// 游戏状态管理 - Zustand
import { create } from 'zustand';

interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  health: number;
  level: number;
}

interface Zombie {
  id: string;
  type: string;
  x: number;
  y: number;
  health: number;
}

interface Resource {
  id: string;
  type: string;
  x: number;
  y: number;
  amount: number;
}

interface GameState {
  // 游戏状态
  connected: boolean;
  phase: string;
  dayTime: number;
  dayNumber: number;
  
  // 实体
  players: Player[];
  zombies: Zombie[];
  resources: Resource[];
  
  // 玩家数据
  localPlayerId: string | null;
  
  // UI状态
  showInventory: boolean;
  showCrafting: boolean;
  showBuilding: boolean;
  
  // Actions
  setConnected: (connected: boolean) => void;
  updateWorldState: (state: any) => void;
  setLocalPlayerId: (id: string) => void;
  toggleInventory: () => void;
  toggleCrafting: () => void;
  toggleBuilding: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  connected: false,
  phase: 'day',
  dayTime: 12,
  dayNumber: 1,
  players: [],
  zombies: [],
  resources: [],
  localPlayerId: null,
  showInventory: false,
  showCrafting: false,
  showBuilding: false,
  
  setConnected: (connected) => set({ connected }),
  
  updateWorldState: (state) => set({
    phase: state.phase,
    dayTime: state.dayTime,
    dayNumber: state.dayNumber,
    players: state.players || [],
    zombies: state.zombies || [],
    resources: state.resources || []
  }),
  
  setLocalPlayerId: (id) => set({ localPlayerId: id }),
  
  toggleInventory: () => set((state) => ({ 
    showInventory: !state.showInventory,
    showCrafting: false,
    showBuilding: false 
  })),
  
  toggleCrafting: () => set((state) => ({ 
    showCrafting: !state.showCrafting,
    showInventory: false,
    showBuilding: false 
  })),
  
  toggleBuilding: () => set((state) => ({ 
    showBuilding: !state.showBuilding,
    showInventory: false,
    showCrafting: false 
  }))
}));
