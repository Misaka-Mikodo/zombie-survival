// 服务器入口 - 简化版
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// 简化版游戏状态（内存存储）
const gameState = {
  players: new Map(),
  zombies: new Map(),
  resources: [],
  dayTime: 12,
  phase: 'day',
  dayNumber: 1
};

// 生成资源点
function generateResources() {
  const types = ['wood', 'stone', 'metal', 'food', 'herb'];
  for (let i = 0; i < 50; i++) {
    gameState.resources.push({
      id: `resource_${i}`,
      type: types[Math.floor(Math.random() * types.length)],
      x: Math.random() * 1800 + 100,
      y: Math.random() * 1800 + 100,
      amount: 5
    });
  }
}

generateResources();

// Socket.io 处理
io.on('connection', (socket) => {
  console.log(`[Server] Player connected: ${socket.id}`);

  // 玩家加入
  socket.on('join', (data) => {
    const player = {
      id: socket.id,
      name: data.name || 'Player',
      x: 1000,
      y: 1000,
      health: 100,
      level: 1,
      experience: 0
    };
    gameState.players.set(socket.id, player);
    
    socket.emit('joined', {
      playerId: socket.id,
      player,
      mapWidth: 2000,
      mapHeight: 2000
    });
    
    console.log(`[Server] Player joined: ${player.name}`);
  });

  // 玩家移动
  socket.on('move', (data) => {
    const player = gameState.players.get(socket.id);
    if (player) {
      player.x = Math.max(0, Math.min(2000, data.x));
      player.y = Math.max(0, Math.min(2000, data.y));
    }
  });

  // 收集资源
  socket.on('harvest', (data) => {
    const player = gameState.players.get(socket.id);
    if (!player) return;
    
    const resource = gameState.resources.find(r => r.id === data.resourceId);
    if (resource && resource.amount > 0) {
      resource.amount = Math.max(0, resource.amount - 1);
      socket.emit('harvestResult', {
        success: true,
        resource: resource.type,
        amount: 1
      });
    }
  });

  // 攻击
  socket.on('attack', (data) => {
    const zombie = gameState.zombies.get(data.targetId);
    if (zombie) {
      zombie.health -= 10;
      if (zombie.health <= 0) {
        gameState.zombies.delete(data.targetId);
      }
      socket.emit('attackResult', {
        damage: 10,
        killed: zombie.health <= 0
      });
    }
  });

  // 断开
  socket.on('disconnect', () => {
    gameState.players.delete(socket.id);
    console.log(`[Server] Player disconnected: ${socket.id}`);
  });
});

// 游戏循环
setInterval(() => {
  // 广播世界状态
  io.emit('worldState', {
    tick: Date.now(),
    phase: gameState.phase,
    dayTime: gameState.dayTime,
    dayNumber: gameState.dayNumber,
    players: Array.from(gameState.players.values()),
    zombies: Array.from(gameState.zombies.values()),
    resources: gameState.resources
  });
}, 1000 / 30);

// 启动服务器
httpServer.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
});
