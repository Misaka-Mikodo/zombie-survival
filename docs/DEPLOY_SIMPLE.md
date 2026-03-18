# 🚀 一键部署指南

## 最简单的部署方式 (Vercel)

### 步骤 1: 安装 Vercel CLI
```bash
npm i -g vercel
```

### 步骤 2: 一键部署
```bash
vercel login
cd /home/misaka/.openclaw/workspace/zombie-survival-game
vercel deploy --prod
```

就这两步！🎉

---

## 或者使用 GitHub 部署

1. 推送代码到 GitHub
2. 打开 https://vercel.com
3. 点击 "New Project"
4. 导入你的 GitHub 仓库
5. 点击 "Deploy" 完成！

---

## 部署预览

| 服务 | 免费额度 | 用途 |
|------|---------|------|
| **Vercel** | 100GB/月带宽 | 前端 + API |
| **Render** | 750小时/月 | 后端服务 |

---

## 本地运行

```bash
# 安装依赖
npm install
cd client && npm install
cd ../server && npm install
cd ..

# 启动开发
npm run dev
```

---

## 云服务推荐 (完全免费)

### 方案 1: Vercel (推荐)
- 前端部署
- 自动HTTPS
- 全球CDN

### 方案 2: Render
- 后端服务
- WebSocket支持

### 方案 3: Railway
- 全栈部署
- $5/月额度
