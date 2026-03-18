# 僵尸生存者 - 技术方案文档

**版本**: V1.0  
**日期**: 2026-03-18  
**项目**: Zombie Survival: Sanctuary

---

## 1. 技术架构总览

### 1.1 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端 (Browser)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   游戏渲染   │  │  状态管理   │  │  网络通信   │            │
│  │  (Canvas)   │  │   (Zustand) │  │ (WebSocket) │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        游戏服务器                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  游戏逻辑    │  │   同步     │  │   AI计算    │            │
│  │  (Node.js)  │  │  (Socket.io)│  │  (A*)       │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        数据存储                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  PostgreSQL │  │   Redis     │  │   S3/文件   │            │
│  │  (玩家数据)  │  │  (缓存/会话) │  │  (静态资源)  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈

| 层级 | 技术选型 | 理由 |
|------|---------|------|
| 前端框架 | React 18 + TypeScript | 组件化、类型安全 |
| 游戏渲染 | PixiJS / 原生Canvas | 高性能2D渲染 |
| 状态管理 | Zustand | 轻量、简单 |
| 后端框架 | Node.js + Express | 统一JS语言 |
| 实时通信 | Socket.io | 成熟的WebSocket封装 |
| 数据库 | PostgreSQL | 关系型、JSON支持 |
| 缓存 | Redis | 会话、热点数据 |
| 游戏物理 | Matter.js | 轻量2D物理引擎 |
| 地图编辑器 | Tiled | 成熟的开源地图工具 |

---

## 2. 前端架构

### 2.1 目录结构

```
client/
├── src/
│   ├── components/          # React组件
│   │   ├── Game/           # 游戏相关组件
│   │   │   ├── GameCanvas.tsx
│   │   │   ├── HUD.tsx
│   │   │   ├── Inventory.tsx
│   │   │   ├── Crafting.tsx
│   │   │   └── Building.tsx
│   │   ├── UI/             # 通用UI组件
│   │   └── Login/          # 登录注册
│   ├── game/               # 游戏核心逻辑
│   │   ├── renderer/       # 渲染器
│   │   ├── entities/       # 游戏实体
│   │   ├── systems/        # 游戏系统
│   │   └── network/        # 网络同步
│   ├── stores/             # Zustand状态
│   ├── hooks/              # 自定义Hooks
│   ├── services/          # API服务
│   ├── types/              # TypeScript类型
│   └── utils/              # 工具函数
├── public/
│   ├── assets/            # 图片/音效
│   └── sprites/          # 精灵图
└── index.html
```

### 2.2 核心类设计

```typescript
// 游戏实体基类
class Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: EntityType;
  update(delta: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}

// 玩家类
class Player extends Entity {
  stats: PlayerStats;
  inventory: Inventory;
  equipment: Equipment;
  position: Vector2;
  velocity: Vector2;
  
  move(direction: Vector2): void;
  attack(target: Entity): void;
  useItem(item: Item): void;
}

// 僵尸类
class Zombie extends Entity {
  type: ZombieType;
  health: number;
  target: Vector2 | Player;
  state: 'idle' | 'walking' | 'attacking';
  
  findPath(target: Vector2): Path;
  attack(target: Entity): void;
}

// 物品类
class Item {
  id: string;
  name: string;
  type: ItemType;
  stackable: boolean;
  maxStack: number;
  quantity: number;
  metadata: ItemMetadata;
}
```

### 2.3 渲染管线

```
Game Loop (60 FPS)
    │
    ▼
┌─────────────────┐
│  Input Handle  │ ← 键盘/鼠标/触摸
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Game Update    │ ← 物理/AI/逻辑
│  - Player move │
│  - Zombie AI   │
│  - Collision   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  State Sync     │ ← WebSocket同步
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Render Frame   │ ← Canvas绘制
│  - Clear       │
│  - Draw map    │
│  - Draw entities│
│  - Draw UI     │
└─────────────────┘
```

---

## 3. 后端架构

### 3.1 目录结构

```
server/
├── src/
│   ├── game/               # 游戏服务器核心
│   │   ├── GameServer.ts    # 主服务器类
│   │   ├── GameRoom.ts      # 游戏房间
│   │   ├── World.ts         # 世界管理
│   │   ├── entities/        # 实体管理
│   │   │   ├── Player.ts
│   │   │   ├── Zombie.ts
│   │   │   └── Item.ts
│   │   ├── systems/         # 游戏系统
│   │   │   ├── DayNight.ts  # 昼夜系统
│   │   │   ├── Spawner.ts   # 僵尸生成
│   │   │   ├── Combat.ts    # 战斗系统
│   │   │   └── Crafting.ts  # 合成系统
│   │   └── ai/              # AI
│   │       └── PathFinder.ts
│   ├── network/             # 网络层
│   │   ├── SocketHandler.ts
│   │   └── MessageProtocol.ts
│   ├── db/                  # 数据库
│   │   ├── postgres.ts
│   │   ├── redis.ts
│   │   └── repositories/
│   ├── api/                 # HTTP API
│   │   ├── auth.ts
│   │   └── user.ts
│   └── utils/
├── migrations/              # 数据库迁移
├── scripts/                 # 工具脚本
└── config/
```

### 3.2 游戏循环

```typescript
// GameServer.ts
class GameServer {
  private tickRate = 30; // 30 TPS
  private updateInterval = 1000 / 30;
  
  start() {
    setInterval(() => this.gameLoop(), this.updateInterval);
  }
  
  private gameLoop() {
    // 1. 处理玩家输入
    this.handlePlayerInputs();
    
    // 2. 更新游戏状态
    this.world.update();
    
    // 3. 更新AI
    this.aiSystem.update();
    
    // 4. 碰撞检测
    this.physicsSystem.update();
    
    // 5. 同步状态给客户端
    this.broadcastWorldState();
  }
}
```

### 3.3 网络协议

```typescript
// 消息类型定义
interface ClientMessage {
  type: 'input' | 'chat' | 'action';
  payload: InputPayload | ChatPayload | ActionPayload;
  timestamp: number;
}

interface ServerMessage {
  type: 'state' | 'event' | 'error';
  payload: WorldState | GameEvent | ErrorPayload;
}

// 状态同步策略
interface WorldState {
  tick: number;
  players: PlayerState[];
  zombies: ZombieState[];
  items: ItemState[];
  weather: WeatherState;
  dayTime: number;
}
```

---

## 4. 数据库设计

### 4.1 ER图

```
┌──────────────┐       ┌──────────────┐
│    users    │       │   players    │
├──────────────┤       ├──────────────┤
│ id (PK)      │◄──────│ user_id (FK) │
│ username     │       │ id (PK)      │
│ email        │       │ name         │
│ password_hash│       │ level        │
│ created_at   │       │ experience   │
│ updated_at   │       │ health       │
└──────────────┘       │ stamina      │
                       │ map_id (FK)  │
                       │ created_at   │
                       └──────┬───────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  inventories │    │  equipment   │    │   maps      │
├──────────────┤    ├──────────────┤    ├──────────────┤
│ id (PK)      │    │ id (PK)      │    │ id (PK)     │
│ player_id(FK)│    │ player_id(FK)│    │ name        │
│ item_id (FK)│    │ slot         │    │ width       │
│ slot         │    │ item_id (FK) │    │ height      │
│ quantity     │    │ created_at   │    │ data (JSON) │
│ created_at   │    └──────────────┘    │ created_at  │
└──────────────┘                         └──────────────┘
        │
        ▼
┌──────────────┐
│    items     │
├──────────────┤
│ id (PK)      │
│ name         │
│ type         │
│ stackable    │
│ max_stack    │
│ recipe (JSON)│
│ stats (JSON) │
└──────────────┘
```

### 4.2 Redis缓存策略

| Key | 过期时间 | 用途 |
|-----|---------|------|
| `session:{userId}` | 24h | 用户会话 |
| `room:{roomId}` | 房间存在时 | 游戏房间状态 |
| `world:{roomId}` | 房间存在时 | 当前世界快照 |
| `leaderboard` | 5min | 排行榜数据 |

---

## 5. 关键技术方案

### 5.1 实时同步方案

```
客户端预测 + 服务器校验 + 延迟补偿

Client                          Server
  │                                │
  │──── Move Input (timestamp) ────►
  │                                │ 验证/处理
  │                                │
  │◄─── World State (interpolated)─│
  │                                │
  │  [本地预测移动]                │  [服务器权威位置]
  │                                │
  │─────── Server Correction ──────►│  如果客户端预测错误
  │                                │  校正位置
```

### 5.2 僵尸寻路方案

使用 **A*算法** + **流场寻路** 混合：

```typescript
// 对于大量僵尸，使用流场(Flow Field)
class FlowFieldPathfinder {
  private grid: Grid<Tile>;
  private flowField: Vector2[][];
  
  // 预计算从目标点到所有格子的方向
  generateFlowField(target: Vector2): void {
    // BFS从目标点扩散
    // 每个格子记录指向最近目标的方向
  }
  
  getDirection(from: Vector2): Vector2 {
    return this.flowField[from.x][from.y];
  }
}
```

### 5.3 昼夜系统

```typescript
class DayNightSystem {
  private dayLength = 6 * 60 * 1000; // 6分钟
  private nightLength = 2 * 60 * 1000; // 2分钟
  
  private phase: 'day' | 'twilight' | 'night' = 'day';
  private timer = 0;
  
  update(delta: number) {
    this.timer += delta;
    
    if (this.phase === 'day' && this.timer >= this.dayLength) {
      this.transitionTo('twilight');
    } else if (this.phase === 'twilight' && this.timer >= 5 * 60 * 1000) {
      this.transitionTo('night');
      this.spawner.startWave();
    } else if (this.phase === 'night' && this.timer >= this.nightLength) {
      this.transitionTo('day');
    }
  }
}
```

---

## 6. 部署架构

### 6.1 Docker Compose

```yaml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - game-server
      - web-server
  
  web-server:
    build: ./client
    environment:
      - NODE_ENV=production
  
  game-server:
    build: ./server
    environment:
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine

volumes:
  postgres_data:
```

### 6.2 扩展策略

```
                    ┌─────────────┐
                    │   Nginx     │
                    │  (负载均衡)  │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
  ┌─────────┐        ┌─────────┐        ┌─────────┐
  │ Server1 │        │ Server2 │        │ Server3 │
  │ (Room1) │        │ (Room2) │        │ (Room3) │
  └─────────┘        └─────────┘        └─────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────┴──────┐
                    │  PostgreSQL │
                    │   + Redis   │
                    └─────────────┘
```

---

## 7. 开发规范

### 7.1 Git工作流

- `main` - 生产分支
- `develop` - 开发分支
- `feature/*` - 功能分支
- `fix/*` - 修复分支
- PR必须经过Code Review

### 7.2 代码规范

- ESLint + Prettier
- TypeScript Strict Mode
- 组件注释JSDoc

### 7.3 提交规范

```
feat: 新功能
fix: 修复
docs: 文档
style: 格式
refactor: 重构
test: 测试
chore: 构建/工具
```

---

## 8. 测试计划

| 层级 | 测试类型 | 工具 |
|------|---------|------|
| 单元测试 | Jest | 业务逻辑 |
| E2E测试 | Playwright | 关键流程 |
| 压力测试 | k6 | 服务器性能 |
| 性能测试 | Lighthouse | 前端性能 |

---

*文档版本: V1.0 | 作者: OpenClaw Agent | 日期: 2026-03-18*
