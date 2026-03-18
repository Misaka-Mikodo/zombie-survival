// 游戏主组件
import React, { useEffect, useRef, useState } from 'react';
import { GameRenderer } from '../../game/renderer/GameRenderer';
import { GameAPIClient } from '../../game/network/GameAPIClient';
import { useGameStore } from '../../stores/gameStore';

export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const clientRef = useRef<GameAPIClient | null>(null);
  const playerPosRef = useRef({ x: 1000, y: 1000 });
  const [error, setError] = useState('');
  
  const [playerName, setPlayerName] = useState('');
  const [joined, setJoined] = useState(false);
  
  const { 
    updateWorldState,
    players,
    dayTime,
    phase 
  } = useGameStore();

  useEffect(() => {
    if (!canvasRef.current) return;
    
    try {
      rendererRef.current = new GameRenderer(canvasRef.current);
      clientRef.current = new GameAPIClient();
      
      console.log('Client initialized, starting polling...');
      
      // 开始轮询游戏状态
      clientRef.current.startPolling((state) => {
        console.log('State received:', state);
        updateWorldState(state);
        if (rendererRef.current) {
          rendererRef.current.render(state);
        }
      }, 1000);
    } catch (e) {
      console.error('Init error:', e);
      setError(String(e));
    }
    
    return () => {
      clientRef.current?.stopPolling();
    };
  }, []);

  const handleJoin = async () => {
    if (!playerName.trim()) {
      setError('请输入名字');
      return;
    }
    
    try {
      console.log('Joining with name:', playerName);
      const data = await clientRef.current?.join(playerName);
      console.log('Join result:', data);
      setJoined(true);
      playerPosRef.current = { x: 1000, y: 1000 };
      setError('');
    } catch (e) {
      console.error('Join error:', e);
      setError('加入失败: ' + String(e));
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!clientRef.current || !joined) return;
    
    const speed = 5;
    let dx = 0, dy = 0;
    
    switch (e.key) {
      case 'w': case 'ArrowUp': dy = -speed; break;
      case 's': case 'ArrowDown': dy = speed; break;
      case 'a': case 'ArrowLeft': dx = -speed; break;
      case 'd': case 'ArrowRight': dx = speed; break;
    }
    
    if (dx !== 0 || dy !== 0) {
      playerPosRef.current.x += dx;
      playerPosRef.current.y += dy;
      clientRef.current?.move(playerPosRef.current.x, playerPosRef.current.y);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [joined]);

  if (!joined) {
    return (
      <div className="login-screen">
        <h1>🧟 僵尸生存者</h1>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="输入你的名字"
        />
        <button onClick={handleJoin}>开始游戏</button>
        {error && <p style={{color: 'red', marginTop: '10px'}}>{error}</p>}
      </div>
    );
  }

  return (
    <div className="game-container">
      <canvas ref={canvasRef} width={800} height={600} />
      <div className="hud">
        <span>🕐 {dayTime.toFixed(1)}</span>
        <span>{phase === 'day' ? '☀️ 白天' : phase === 'twilight' ? '🌆 黄昏' : '🧟 夜晚'}</span>
        <span>👥 {players.length} 玩家</span>
      </div>
    </div>
  );
};
