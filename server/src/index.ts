// 服务器入口 - 适配Vercel无服务器模式
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

// 生成资源
function initResources() {
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
}
initResources();

// 简单轮询API (替代WebSocket)
// 为了在Vercel Serverless上运行，我们需要用轮询
// 实际生产环境建议用第三方WebSocket服务

app.get('/api/state', (req, res) => {
  const playerId = req.query.playerId as string;
  
  // 更新玩家位置
  const px = parseInt(req.query.x as string);
  const py = parseInt(req.query.y as string);
  if (playerId && !isNaN(px) && !isNaN(py)) {
    const player = gameState.players.get(playerId);
    if (player) {
      player.x = Math.max(0, Math.min(2000, px));
      player.y = Math.max(0, Math.min(2000, py));
    }
  }
  
  res.json({
    tick: gameState.tick++,
    phase: gameState.phase,
    dayTime: gameState.dayTime,
    dayNumber: gameState.dayNumber,
    players: Array.from(gameState.players.values()),
    zombies: Array.from(gameState.zombies.values()),
    resources: gameState.resources
  });
});

app.post('/api/join', (req, res) => {
  const { name } = req.body;
  const playerId = 'player_' + Date.now();
  
  const player = {
    id: playerId,
    name: name || 'Player',
    x: 1000,
    y: 1000,
    health: 100,
    level: 1,
    experience: 0
  };
  
  gameState.players.set(playerId, player);
  
  res.json({
    playerId,
    player,
    mapWidth: 2000,
    mapHeight: 2000
  });
});

app.post('/api/harvest', (req, res) => {
  const { playerId, resourceId } = req.body;
  const resource = gameState.resources.find(r => r.id === resourceId);
  
  if (resource && resource.amount > 0) {
    resource.amount--;
    res.json({ success: true, resource: resource.type, amount: 1 });
  } else {
    res.json({ success: false });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Vercel serverless需要导出handler
export default app;
