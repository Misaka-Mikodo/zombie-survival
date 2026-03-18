// Vercel API路由 - 游戏状态
const gameState = {
  players: new Map(),
  zombies: new Map(),
  buildings: new Map(),
  resources: [] as any[],
  tick: 0,
  dayTime: 12,
  phase: 'day',
  dayNumber: 1,
  wave: 0,
  lastWaveTime: Date.now()
};

const TYPES = ['wood', 'stone', 'metal', 'food', 'herb'];
const ZOMBIE_TYPES = ['normal', 'fast', 'giant', 'crawler'];

// 初始化资源
for (let i = 0; i < 80; i++) {
  gameState.resources.push({
    id: `resource_${i}`,
    type: TYPES[Math.floor(Math.random() * TYPES.length)],
    x: Math.floor(Math.random() * 1800 + 100),
    y: Math.floor(Math.random() * 1800 + 100),
    amount: 3
  });
}

// 生成僵尸波次
function spawnZombieWave() {
  gameState.wave++;
  const count = 5 + gameState.wave * 2;
  
  for (let i = 0; i < count; i++) {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    switch (side) {
      case 0: x = Math.random() * MAP_WIDTH; y = -50; break;
      case 1: x = MAP_WIDTH + 50; y = Math.random() * MAP_HEIGHT; break;
      case 2: x = Math.random() * MAP_WIDTH; y = MAP_HEIGHT + 50; break;
      default: x = -50; y = Math.random() * MAP_HEIGHT;
    }
    
    const type = ZOMBIE_TYPES[Math.floor(Math.random() * ZOMBIE_TYPES.length)];
    const hp = type === 'giant' ? 200 : type === 'fast' ? 30 : type === 'crawler' ? 40 : 50;
    
    gameState.zombies.set(`zombie_${gameState.tick}_${i}`, {
      id: `zombie_${gameState.tick}_${i}`,
      type,
      x,
      y,
      health: hp,
      maxHealth: hp
    });
  }
}

const MAP_WIDTH = 2000;
const MAP_HEIGHT = 2000;

export default function handler(req: any, res: any) {
  const { method } = req;
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') return res.status(200).end();
  
  // 更新昼夜
  gameState.dayTime += 0.1;
  if (gameState.dayTime >= 24) {
    gameState.dayTime = 6;
    gameState.dayNumber++;
  }
  
  // 黄昏/夜晚逻辑
  if (gameState.dayTime >= 18 && gameState.dayTime < 20) {
    gameState.phase = 'twilight';
  } else if (gameState.dayTime >= 20 || gameState.dayTime < 6) {
    gameState.phase = 'night';
    // 夜晚生成僵尸
    if (Date.now() - gameState.lastWaveTime > 30000 && gameState.wave < gameState.dayNumber * 2) {
      spawnZombieWave();
      gameState.lastWaveTime = Date.now();
    }
  } else {
    gameState.phase = 'day';
    // 白天僵尸减少
    if (gameState.zombies.size > 0 && Math.random() < 0.05) {
      const firstKey = gameState.zombies.keys().next().value;
      if (firstKey) gameState.zombies.delete(firstKey);
    }
  }
  
  if (method === 'GET') {
    const playerId = req.query.playerId;
    const px = parseInt(req.query.x);
    const py = parseInt(req.query.y);
    
    if (playerId && !isNaN(px) && !isNaN(py)) {
      const player = gameState.players.get(playerId);
      if (player) {
        player.x = Math.max(0, Math.min(MAP_WIDTH, px));
        player.y = Math.max(0, Math.min(MAP_HEIGHT, py));
      }
    }
    
    return res.json({
      tick: gameState.tick++,
      phase: gameState.phase,
      dayTime: gameState.dayTime,
      dayNumber: gameState.dayNumber,
      wave: gameState.wave,
      players: Array.from(gameState.players.values()),
      zombies: Array.from(gameState.zombies.values()),
      resources: gameState.resources,
      buildings: Array.from(gameState.buildings.values())
    });
  }
  
  if (method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { action, ...data } = body;
    
    if (action === 'join') {
      const playerId = 'player_' + Date.now();
      const player = {
        id: playerId,
        name: data.name || 'Player',
        x: 1000,
        y: 1000,
        health: 100,
        level: 1,
        weapon: null
      };
      gameState.players.set(playerId, player);
      
      return res.json({
        playerId,
        player,
        mapWidth: MAP_WIDTH,
        mapHeight: MAP_HEIGHT
      });
    }
    
    if (action === 'harvest') {
      const { playerId, resourceId, resourceType } = data;
      const resource = gameState.resources.find(r => r.id === resourceId);
      
      if (resource && resource.amount > 0) {
        resource.amount--;
        
        // 添加到玩家背包（这里简化处理）
        const player = gameState.players.get(playerId);
        if (player) {
          player.inventory = player.inventory || {};
          player.inventory[resourceType] = (player.inventory[resourceType] || 0) + 1;
        }
        
        return res.json({ success: true, resource: resourceType, amount: 1 });
      }
      return res.json({ success: false });
    }
    
    if (action === 'attack') {
      const { targetId, damage } = data;
      const zombie = gameState.zombies.get(targetId);
      
      if (zombie) {
        zombie.health -= (damage || 10);
        if (zombie.health <= 0) {
          gameState.zombies.delete(targetId);
          return res.json({ killed: true, damage: damage || 10 });
        }
        return res.json({ killed: false, damage: damage || 10 });
      }
      return res.json({ error: 'Target not found' });
    }
    
    if (action === 'craft') {
      // 简化处理
      return res.json({ success: true });
    }
  }
  
  return res.status(404).json({ error: 'Not found' });
}
