# AGENTS.md - 项目上下文

## 项目概述

**项目名称**: Zombie Survival: Sanctuary  
**类型**: 2D多人联机沙盒僵尸生存游戏  
**技术栈**: React + TypeScript + Node.js + Socket.io + PostgreSQL + Redis

---

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/games-zombie-survival/zombie-survival.git
cd zombie-survival

# 安装依赖
npm install

# 启动开发
npm run dev
```

---

## 项目结构

```
zombie-survival/
├── docs/                    # 文档目录 (重要!)
│   ├── PRD.md              # 需求文档
│   ├── TECH_SPEC.md        # 技术方案
│   ├── DEPLOY.md           # 部署指南
│   ├── CHANGELOG.md        # 更新日志
│   └── features/           # 功能开发文档
├── client/                 # 前端 (React + PixiJS)
├── server/                 # 后端 (Node.js + Socket.io)
└── docker/                 # Docker配置
```

---

## 开发规范

### 1. 文档要求 (重要!)

**每次功能开发必须创建文档**，格式：

```markdown
---
feature: 功能名称
status: in-progress | done | planned
developer: Agent名称
date: 2026-03-18
---

# 功能: [名称]

## 需求
- 需求点1
- 需求点2

## 实现
- 实现点1
- 实现点2

## 待完成
- [ ] 待完成项1
- [ ] 待完成项2
```

**文档位置**: `docs/features/FEATURE_NAME.md`

### 2. 提交规范

```bash
# 格式
git commit -m "feat: 添加功能名称"

# 类型
feat:     新功能
fix:      修复
docs:     文档
refactor: 重构
test:     测试
chore:    构建/工具
```

### 3. 代码规范

- 使用 TypeScript Strict Mode
- ESLint + Prettier
- 组件注释 JSDoc

---

## 当前开发状态

### Phase 1: 基础框架 ✅ 完成
- [x] 昼夜循环系统
- [x] 资源收集系统
- [x] 合成系统
- [x] 僵尸AI

### Phase 2: 核心玩法 🔄 进行中
- [ ] 用户系统
- [ ] 角色系统
- [ ] 背包系统
- [ ] 地图系统

### Phase 3: 联机系统 📋 待开始
- [ ] WebSocket多人同步
- [ ] 房间系统

### Phase 4: 战斗系统 📋 待开始
- [ ] 武器系统
- [ ] 伤害计算
- [ ] 僵尸波次

### Phase 5: 数据持久化 📋 待开始
- [ ] PostgreSQL集成
- [ ] 玩家存档

---

## 关键文件

| 文件 | 用途 |
|------|------|
| `server/src/game/GameServer.ts` | 游戏主服务器 |
| `server/src/game/systems/DayNightSystem.ts` | 昼夜系统 |
| `server/src/game/systems/CraftingSystem.ts` | 合成系统 |
| `server/src/game/ai/ZombieAI.ts` | 僵尸AI |
| `client/src/types/game.ts` | 类型定义 |

---

## 环境变量

```env
# server/.env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=zomgame
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 测试

```bash
# 单元测试
npm run test

# E2E测试
npm run test:e2e

# 构建
npm run build
```

---

## 部署

详见 `docs/DEPLOY.md`

**免费方案**:
- 前端: Vercel
- 后端: Render
- 数据库: Supabase

---

## Release Note 更新

每次发布需要更新 `docs/CHANGELOG.md`:

```markdown
## [版本号] - 日期

### 新增
- 功能A

### 修复
- 问题B

### 优化
- 性能提升
```

---

*最后更新: 2026-03-18*
