// Vercel API路由 - 游戏状态
// 使用全局变量保持状态
let gameState: any = null;

function initGameState() {
  if (gameState) return;
  
  gameState = {
    players: new Map(),
    zombies: new Map(),
    buildings: new Map(),
    bullets: [],
    resources: [],
    tick: 0,
    dayTime: 12,
    phase: 'day',
    dayNumber: 1,
    wave: 0,
    lastWaveTime: Date.now()
  };
  
  const TYPES = ['wood', 'stone', 'metal', 'food', 'herb', 'gold', 'diamond'];
  
  // 初始化更多资源
  for (let i = 0; i < 150; i++) {
    if (gameState.resources.length < 50) gameState.resources.push({
      id: `resource_${i}`,
      type: TYPES[i % TYPES.length],
      x: Math.floor(Math.random() * 1800 + 100),
      y: Math.floor(Math.random() * 1800 + 100),
      amount: 3
    });
  }
}

// 更新昼夜循环和僵尸移动
function updateDayNight() {
  if (!gameState) return;
  
  gameState.dayTime += 0.1;
  
  if (gameState.dayTime >= 24) {
    gameState.dayTime = 6;
    gameState.dayNumber++;
  }
  
  // 判断阶段
  if (gameState.dayTime >= 18 && gameState.dayTime < 20) {
    gameState.phase = 'twilight';
  } else if (gameState.dayTime >= 20 || gameState.dayTime < 6) {
    gameState.phase = 'night';
    if (Date.now() - gameState.lastWaveTime > 10000 && gameState.wave < 15) {
      spawnZombieWave();
      gameState.lastWaveTime = Date.now();
    }
  } else {
    gameState.phase = 'day';
  }
  
  // 更新僵尸移动 - 向玩家移动
  for (const [id, zombie] of gameState.zombies) {
    const players = Array.from(gameState.players.values());
    if (players.length > 0) {
      // 找最近的玩家
      let nearest = null;
      let minDist = Infinity;
      for (const p of players) {
        const d = Math.hypot(p.x - zombie.x, p.y - zombie.y);
        if (d < minDist) {
          minDist = d;
          nearest = p;
        }
      }
      
      if (nearest && minDist > 30) {
        // 向玩家移动
        const speed = zombie.speed || 1;
        zombie.x += (nearest.x - zombie.x) / minDist * speed;
        zombie.y += (nearest.y - zombie.y) / minDist * speed;
      }
    }
  }
  
  // 更新子弹
  updateBullets();
  
  // 炮台自动攻击
  updateTurrets();
}

function updateBullets() {
  if (!gameState) return;
  
  for (let i = gameState.bullets.length - 1; i >= 0; i--) {
    const bullet = gameState.bullets[i];
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    bullet.life--;
    
    // 检测击中僵尸
    for (const [id, zombie] of gameState.zombies) {
      const dist = Math.hypot(zombie.x - bullet.x, zombie.y - bullet.y);
      if (dist < 25) {
        zombie.health -= bullet.damage;
        bullet.life = 0;
        
        if (zombie.health <= 0) {
          gameState.zombies.delete(id);
        }
        break;
      }
    }
    
    if (bullet.life <= 0) {
      gameState.bullets.splice(i, 1);
    }
  }
}

function updateTurrets() {
  if (!gameState) return;
  
  for (const [id, building] of gameState.buildings) {
    if (building.type === 'turret' && building.cooldown <= 0) {
      // 找最近的僵尸
      let nearest = null;
      let minDist = 300; // 射程
      
      for (const [zid, zombie] of gameState.zombies) {
        const d = Math.hypot(zombie.x - building.x, zombie.y - building.y);
        if (d < minDist) {
          minDist = d;
          nearest = zombie;
        }
      }
      
      if (nearest) {
        // 发射子弹
        const angle = Math.atan2(nearest.y - building.y, nearest.x - building.x);
        gameState.bullets.push({
          id: 'bullet_' + Date.now() + '_' + Math.random(),
          x: building.x,
          y: building.y,
          vx: Math.cos(angle) * 10,
          vy: Math.sin(angle) * 10,
          damage: 15,
          life: 60
        });
        building.cooldown = 30;
      }
    }
    
    if (building.cooldown > 0) building.cooldown--;
  }
}

function spawnZombieWave() {
  if (!gameState) return;
  
  gameState.wave++;
  const count = 3 + gameState.wave;
  const ZOMBIE_TYPES = ['normal', 'fast', 'giant', 'crawler'];
  const MAP_WIDTH = 2000;
  const MAP_HEIGHT = 2000;
  
  for (let i = 0; i < count; i++) {
    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    switch (side) {
      case 0: x = Math.random() * MAP_WIDTH; y = -30; break;
      case 1: x = MAP_WIDTH + 30; y = Math.random() * MAP_HEIGHT; break;
      case 2: x = Math.random() * MAP_WIDTH; y = MAP_HEIGHT + 30; break;
      default: x = -30; y = Math.random() * MAP_HEIGHT;
    }
    
    const type = ZOMBIE_TYPES[Math.floor(Math.random() * ZOMBIE_TYPES.length)];
    const hp = type === 'giant' ? 200 : type === 'fast' ? 30 : type === 'crawler' ? 40 : 50;
    const speed = type === 'fast' ? 3 : type === 'giant' ? 0.5 : 1.5;
    
    gameState.zombies.set(`zombie_${Date.now()}_${i}`, {
      id: `zombie_${Date.now()}_${i}`,
      type,
      x,
      y,
      health: hp,
      maxHealth: hp,
      speed
    });
  }
}

export default function handler(req: any, res: any) {
  initGameState();
  
  const { method } = req;
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') return res.status(200).end();
  
  updateDayNight();
  
  const MAP_WIDTH = 2000;
  const MAP_HEIGHT = 2000;
  
  if (method === 'GET') {
    const playerId = req.query.playerId;
    const px = parseInt(req.query.x);
    const py = parseInt(req.query.y);
    
    if (playerId && !isNaN(px) && !isNaN(py)) {
      const player = gameState.players.get(playerId);
      if (player) {
        player.x = Math.max(0, Math.min(MAP_WIDTH, px));
        player.y = Math.max(0, Math.min(MAP_HEIGHT, py));
      }
    }
    
    return res.json({
      tick: gameState.tick++,
      phase: gameState.phase,
      dayTime: gameState.dayTime,
      dayNumber: gameState.dayNumber,
      wave: gameState.wave,
      players: Array.from(gameState.players.values()),
      zombies: Array.from(gameState.zombies.values()),
      resources: gameState.resources.filter((r: any) => r.amount > 0),
      buildings: Array.from(gameState.buildings.values()),
      bullets: gameState.bullets
    });
  }
  
  if (method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { action, ...data } = body;
    
    if (action === 'join') {
      const playerId = 'player_' + Date.now();
      const player = {
        id: playerId,
        name: data.name || 'Player',
        x: 1000,
        y: 1000,
        health: 100,
        level: 1,
        weapon: null
      };
      gameState.players.set(playerId, player);
      
      return res.json({
        playerId,
        player,
        mapWidth: MAP_WIDTH,
        mapHeight: MAP_HEIGHT
      });
    }
    
    if (action === 'harvest') {
      const { playerId, resourceId } = data;
      const resourceIndex = gameState.resources.findIndex((r: any) => r.id === resourceId);
      
      if (resourceIndex >= 0 && gameState.resources[resourceIndex].amount > 0) {
        gameState.resources[resourceIndex].amount--;
        return res.json({ 
          success: true, 
          resource: gameState.resources[resourceIndex].type, 
          amount: 1,
          remaining: gameState.resources[resourceIndex].amount
        });
      }
      return res.json({ success: false });
    }
    
    if (action === 'attack') {
      const { targetId, damage } = data;
      const zombie = gameState.zombies.get(targetId);
      
      if (zombie) {
        zombie.health -= (damage || 10);
        if (zombie.health <= 0) {
          gameState.zombies.delete(targetId);
          return res.json({ killed: true, damage: damage || 10 });
        }
        return res.json({ killed: false, damage: damage || 10, health: zombie.health });
      }
      return res.json({ error: 'Target not found' });
    }
    
    if (action === 'build') {
      const { playerId, buildingType, x, y } = data;
      const buildingId = 'building_' + Date.now();
      
      gameState.buildings.set(buildingId, {
        id: buildingId,
        type: buildingType,
        x: x || 1000,
        y: y || 1000,
        health: buildingType === 'turret' ? 100 : buildingType === 'wall_stone' ? 300 : 100,
        cooldown: 0
      });
      
      return res.json({ success: true, buildingId });
    }
  }
  
  return res.status(404).json({ error: 'Not found' });
}
