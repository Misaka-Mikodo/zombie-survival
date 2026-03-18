---
feature: turret-building-zombie-movement-effects
status: done
developer: OpenClaw
date: 2026-03-18
yaml_index:
  - 游戏系统
  - 建造系统
  - 战斗系统
---

# 功能: 炮台、僵尸移动、动态效果

## 需求
1. 建造炮台自动攻击僵尸
2. 僵尸会移动向玩家
3. 战斗有动态特效
4. 更多资源种类

## 实现
- 添加炮台(wall_stone, turret)类型建筑
- 炮台自动寻找最近僵尸并射击
- 僵尸AI: 向最近玩家移动
- 添加攻击特效(黄色爆炸圈)
- 添加子弹渲染
- 新增资源: gold(黄金), diamond(钻石)

## 新增资源
- 🪙 gold 黄金
- 💎 diamond 钻石

## 建筑类型
- 木墙: 100血
- 石墙: 300血  
- 炮台: 100血，自动攻击

## 更新日志
- v0.4.2: 添加炮台、僵尸移动、攻击特效
