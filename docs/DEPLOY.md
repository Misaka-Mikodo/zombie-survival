# 部署指南

## 免费云服务推荐

### 1. 前端部署 (Vercel / Netlify) ⭐推荐

| 服务 | 免费额度 | 特点 |
|------|---------|------|
| **Vercel** | 100GB/月带宽 | 零配置部署，自动HTTPS |
| **Netlify** | 100GB/月带宽 | 功能丰富，表单/函数支持 |
| **Cloudflare Pages** | 无限制 | 无限带宽，全球CDN |

**部署步骤 (Vercel)**:
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
cd client
vercel
```

### 2. 后端/游戏服务器部署

#### 选项 A: Render (推荐)
- **免费**: 750小时/月
- **支持**: Node.js, WebSocket
- **地址**: render.com

**render.yaml 示例**:
```yaml
services:
  - type: web
    name: zombie-game-server
    env: node
    region: oregon
    buildCommand: npm install
    startCommand: npm start
```

#### 选项 B: Railway
- **免费**: $5/月额度
- **支持**: Node.js, PostgreSQL, Redis
- **地址**: railway.app

#### 选项 C: Fly.io
- **免费**: 3个虚拟机
- **支持**: Docker, 全球部署
- **地址**: fly.io

#### 选项 D: Heroku (即将收费)
- **免费层级**: 已转为付费
- 不推荐新项目使用

### 3. 数据库

| 服务 | 免费额度 | 用途 |
|------|---------|------|
| **Supabase** | 500MB | PostgreSQL + Redis |
| **Neon** | 1GB | PostgreSQL，分支 |
| **Upstash** | 10K命令/天 | Redis |
| **MongoDB Atlas** | 512MB | NoSQL |

### 4. 完整免费部署方案 (推荐)

```
前端:    Vercel (免费)
后端:    Render (免费) 或 Railway ($5/月)
数据库:  Supabase (免费)
```

---

## 本地开发部署

### 环境要求
- Node.js 18+
- npm 9+

### 安装依赖
```bash
# 根目录
npm install

# 分别安装
cd client && npm install
cd server && npm install
```

### 启动开发服务器
```bash
# 前后端同时启动
npm run dev

# 分别启动
npm run client  # 前端 localhost:5173
npm run server  # 后端 localhost:3001
```

### 构建生产版本
```bash
npm run build
```

---

## Docker 部署

### docker-compose.yml
```yaml
version: '3.8'

services:
  # 前端
  client:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - server

  # 游戏服务器
  server:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis

  # PostgreSQL数据库
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: zomgame
      POSTGRES_PASSWORD: yourpassword
      POSTGRES_DB: zomgame
    volumes:
      - pgdata:/var/lib/postgresql/data

  # Redis缓存
  redis:
    image: redis:7-alpine

volumes:
  pgdata:
```

### 部署命令
```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f
```

---

## 一键部署脚本

### 部署到 Render (Railway类似)
```bash
# 1. 推送到GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. 在Render.com:
#    - Connect GitHub repo
#    - Select Node.js
#    - Build: npm install
#    - Start: npm start
```

---

## 环境变量配置

### 服务器环境变量
```env
# .env
NODE_ENV=production
PORT=3001
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=zomgame
REDIS_HOST=your-redis-host
REDIS_PORT=6379
JWT_SECRET=your-secret-key
```

---

## 性能优化

### 前端优化
- 启用Gzip压缩
- 图片懒加载
- 代码分割
- CDN加速

### 后端优化
- Redis缓存热点数据
- 连接池复用
- WebSocket心跳保活
- 增量状态同步

---

## 监控与日志

### 免费监控服务
- **Sentry** - 错误追踪 (免费)
- **PM2** - 进程管理 + 日志
- **Datadog** - 基础监控 (免费)

### 日志管理
```bash
# 使用PM2
pm2 start server/dist/index.js
pm2 logs

# 查看实时日志
pm2 monit
```

---

## HTTPS 配置

### 使用 Let's Encrypt (免费)

**Nginx 配置**:
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

**自动续期**:
```bash
sudo certbot renew --dry-run
```

---

## 常见问题

### Q: WebSocket连接失败?
A: 确保Nginx配置了WebSocket代理:
```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

### Q: 数据库连接超时?
A: 检查安全组/防火墙是否开放端口5432

### Q: 内存不足?
A: 启用Redis缓存，减少数据库查询

---

*最后更新: 2026-03-18*
