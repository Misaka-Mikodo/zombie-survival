// Vercel API路由 - 游戏状态
import { VercelRequest, VercelResponse } from '@vercel/node';

// 内存存储
const gameState = {
  players: new Map(),
  zombies: new Map(),
  resources: [] as any[],
  tick: 0,
  dayTime: 12,
  phase: 'day',
  dayNumber: 1
};

// 初始化资源
const types = ['wood', 'stone', 'metal', 'food', 'herb'];
for (let i = 0; i < 50; i++) {
  gameState.resources.push({
    id: `resource_${i}`,
    type: types[Math.floor(Math.random() * types.length)],
    x: Math.floor(Math.random() * 1800 + 100),
    y: Math.floor(Math.random() * 1800 + 100),
    amount: 5
  });
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (method === 'GET') {
    // 获取游戏状态 (轮询)
    const playerId = req.query.playerId as string;
    const px = parseInt(req.query.x as string);
    const py = parseInt(req.query.y as string);
    
    if (playerId && !isNaN(px) && !isNaN(py)) {
      const player = gameState.players.get(playerId);
      if (player) {
        player.x = Math.max(0, Math.min(2000, px));
        player.y = Math.max(0, Math.min(2000, py));
      }
    }
    
    return res.json({
      tick: gameState.tick++,
      phase: gameState.phase,
      dayTime: gameState.dayTime,
      dayNumber: gameState.dayNumber,
      players: Array.from(gameState.players.values()),
      zombies: Array.from(gameState.zombies.values()),
      resources: gameState.resources
    });
  }
  
  if (method === 'POST') {
    const { action, ...data } = req.body;
    
    if (action === 'join') {
      const playerId = 'player_' + Date.now();
      const player = {
        id: playerId,
        name: data.name || 'Player',
        x: 1000,
        y: 1000,
        health: 100,
        level: 1,
        experience: 0
      };
      gameState.players.set(playerId, player);
      
      return res.json({
        playerId,
        player,
        mapWidth: 2000,
        mapHeight: 2000
      });
    }
    
    if (action === 'harvest') {
      const { playerId, resourceId } = data;
      const resource = gameState.resources.find(r => r.id === resourceId);
      
      if (resource && resource.amount > 0) {
        resource.amount--;
        return res.json({ success: true, resource: resource.type, amount: 1 });
      }
      return res.json({ success: false });
    }
  }
  
  return res.status(404).json({ error: 'Not found' });
}
