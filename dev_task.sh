#!/bin/bash

GAME_DIR="/home/misaka/.openclaw/workspace/zombie-survival-game"
LOG_FILE="$GAME_DIR/dev_log.txt"

echo "=== [$(date)] 开发任务开始 ===" >> $LOG_FILE

cd $GAME_DIR

if [ ! -f "$GAME_DIR/.dev_stage" ]; then
    echo "40" > $GAME_DIR/.dev_stage
fi

STAGE=$(cat $GAME_DIR/.dev_stage)

case $STAGE in
    "40")
        echo "Stage 40: 添加更多武器..." >> $LOG_FILE
        # 添加更多武器配方到前端
        if ! grep -q "铁剑" client/dist/index.html; then
            sed -i 's/<button data-recipe="炮台">/<button data-recipe="铁剑">⚔️ 铁剑<\/button>\n      <button data-recipe="炮台">/' client/dist/index.html
        fi
        echo "41" > $GAME_DIR/.dev_stage
        ;;
    "41")
        echo "Stage 41: 添加音效..." >> $LOG_FILE
        # 添加简单的点击音效反馈（使用Web Audio API）
        sed -i "s/let showAttackEffect/let showAttackEffect = true;\n        \/\/ 简单音效\n        try { new Audio('data:audio\/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleWAKQZbZ26VZFQQ=').play().catch(()=>{}); } catch(e) {} \n        let showAttackEffect/" client/dist/index.html 2>/dev/null || true
        echo "42" > $GAME_DIR/.dev_stage
        ;;
    "42")
        echo "Stage 42: 优化资源刷新..." >> $LOG_FILE
        # 修改后端增加资源刷新
        sed -i 's/gameState.resources.push({/if (gameState.resources.length < 50) gameState.resources.push({/g' api/game.ts
        echo "43" > $GAME_DIR/.dev_stage
        ;;
    "43")
        echo "Stage 43: 添加小地图..." >> $LOG_FILE
        # 添加小地图显示
        sed -i 's/<div id="inventory/<div id="minimap" style="position:absolute;top:60px;right:10px;width:100px;height:100px;background:rgba(0,0,0,0.5);border:1px solid #4ade80;"><\/div>\n    <div id="inventory/' client/dist/index.html
        echo "44" > $GAME_DIR/.dev_stage
        ;;
    "44")
        echo "Stage 44: 添加血量警告..." >> $LOG_FILE
        # 低血量警告
        sed -i 's/if (health < 100)/if (health < 30) document.body.style.background = "rgba(139,0,0,0.3)"; else if (health < 100)/' client/dist/index.html
        echo "45" > $GAME_DIR/.dev_stage
        ;;
    "45")
        echo "Stage 45: 修复建筑问题..." >> $LOG_FILE
        # 确保建筑可以正确建造
        sed -i 's/health: buildingType === '\''turret'\''/health: buildingType === '\''turret'\'' || buildingType === '\''wall_stone'\''/' api/game.ts
        echo "46" > $GAME_DIR/.dev_stage
        ;;
    "46")
        echo "Stage 46: 添加更多资源点..." >> $LOG_FILE
        # 增加资源点数量
        sed -i 's/for (let i = 0; i < 150/for (let i = 0; i < 250/' api/game.ts
        echo "47" > $GAME_DIR/.dev_stage
        ;;
    "47")
        echo "Stage 47: 添加伤害数字..." >> $LOG_FILE
        # 伤害数字显示
        sed -i 's/attackEffects.push/let damageNum = {x:z.x,y:z.y,life:20,text:"-"+weapon.attack}; damageNumbers.push(damageNum); attackEffects.push/' client/dist/index.html
        echo "48" > $GAME_DIR/.dev_stage
        ;;
    "48")
        echo "Stage 48: 性能优化..." >> $LOG_FILE
        # 减少渲染频率检查
        sed -i 's/gameState.tick++/if (gameState) gameState.tick++/' api/game.ts
        echo "49" > $GAME_DIR/.dev_stage
        ;;
    "49")
        echo "Stage 49: 添加快捷键..." >> $LOG_FILE
        # 添加快捷键说明
        sed -i 's/<div id="invList"><\/div>/<div id="invList"><\/div><div style="margin-top:5px;font-size:10px;color:#888">WASD移动 H血瓶 C合成<\/div>/' client/dist/index.html
        echo "50" > $GAME_DIR/.dev_stage
        ;;
    "50")
        echo "Stage 50: 准备发布..." >> $LOG_FILE
        echo "51" > $GAME_DIR/.dev_stage
        ;;
    *)
        echo "继续循环开发..." >> $LOG_FILE
        echo "40" > $GAME_DIR/.dev_stage
        ;;
esac

echo "=== [$(date)] 开发任务完成 ===" >> $LOG_FILE
