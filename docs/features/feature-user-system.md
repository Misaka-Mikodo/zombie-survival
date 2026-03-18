---
feature: user-system
status: in-progress
developer: OpenClaw
date: 2026-03-18
depends: []
blocks: []
yaml_index:
  - 用户系统
  - 核心功能
  - 数据存储
---

# 功能: 用户系统

## 1. 需求描述

### 背景
玩家需要注册账号来保存游戏进度和角色数据

### 需求点
- [x] 用户注册 (用户名/密码)
- [x] 用户登录 (JWT认证)
- [x] 密码加密存储 (bcrypt)
- [ ] 角色创建
- [ ] 角色数据持久化

---

## 2. 技术设计

### 数据结构
```typescript
interface User {
  id: string;
  username: string;
  email?: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Player {
  id: string;
  userId: string;
  name: string;
  level: number;
  experience: number;
  // ... 游戏数据
}
```

### API设计
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/user/profile` - 获取用户信息

---

## 3. 实现

### 已完成
- [x] 用户实体定义
- [x] 注册/登录API
- [x] JWT认证中间件

### 待完成
- [ ] 角色创建API
- [ ] 玩家数据存储

---

## 4. 待解决

- [ ] 密码重置功能
- [ ] 邮箱验证
