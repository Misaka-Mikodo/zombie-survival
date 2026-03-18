# 🧟 Zombie Survival: Sanctuary

2D多人联机沙盒僵尸生存游戏 - Web-based multiplayer zombie survival game

## 🚀 一键部署

### Vercel (推荐 - 前端+后端)

```bash
# 安装
npm i -g vercel

# 登录
vercel login

# 部署
vercel deploy --prod
```

就 **2步** 完成部署！

---

## 本地开发

```bash
# 克隆
git clone https://github.com/Misaka-Mikodo/zombie-survival.git
cd zombie-survival

# 安装依赖
npm install

# 启动
npm run dev
```

- 前端: http://localhost:5173
- 后端: http://localhost:3001

---

## 游戏特色

- 🌅 **昼夜循环** - 白天收集资源，夜晚抵御尸潮
- 🔨 **合成系统** - 10+配方制作武器装备
- 🏠 **建筑系统** - 建造墙壁、防御塔、储物箱
- 👥 **多人联机** - 实时WebSocket同步
- 🧟 **僵尸AI** - 4种僵尸类型

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React + TypeScript + Canvas |
| 后端 | Node.js + Socket.io |
| 状态 | Zustand |
| 部署 | Vercel |

---

## 文档

- [简明部署指南](./docs/DEPLOY_SIMPLE.md)
- [详细部署文档](./docs/DEPLOY.md)
- [需求文档](./docs/PRD.md)
- [技术方案](./docs/TECH_SPEC.md)

---

## License

MIT
