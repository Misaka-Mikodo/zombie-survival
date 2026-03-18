// 服务器入口
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GameServer } from './game/GameServer';
import { initDatabase } from './db/postgres';
import { initRedis } from './db/redis';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// 初始化游戏服务器
const gameServer = new GameServer(io, PORT);
gameServer.start();

// 启动服务器
httpServer.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  initDatabase();
  initRedis();
});
