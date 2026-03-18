// 游戏主组件
import React, { useEffect, useRef, useState } from 'react';
import { GameRenderer } from '../../game/renderer/GameRenderer';
import { GameSocketClient } from '../../game/network/SocketClient';
import { useGameStore } from '../../stores/gameStore';

export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const clientRef = useRef<GameSocketClient | null>(null);
  
  const [playerName, setPlayerName] = useState('');
  const [joined, setJoined] = useState(false);
  
  const { 
    connected, 
    setConnected, 
    updateWorldState, 
    setLocalPlayerId,
    players,
    dayTime,
    phase 
  } = useGameStore();

  useEffect(() => {
    if (!canvasRef.current) return;
    
    rendererRef.current = new GameRenderer(canvasRef.current);
    clientRef.current = new GameSocketClient();
    
    const client = clientRef.current;
    const renderer = rendererRef.current;
    
    client.connect();
    
    client.on('connect', () => setConnected(true));
    client.on('disconnect', () => setConnected(false));
    client.on('joined', (data) => {
      setLocalPlayerId(data.playerId);
      setJoined(true);
    });
    client.on('worldState', (state) => {
      updateWorldState(state);
      renderer.render(state);
    });
    
    return () => {
      client.disconnect();
    };
  }, []);

  const handleJoin = () => {
    if (playerName && clientRef.current) {
      clientRef.current.join(playerName);
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
      const player = players.find(p => p.id === useGameStore.getState().localPlayerId);
      if (player) {
        clientRef.current.move(player.x + dx, player.y + dy);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [joined, players]);

  if (!joined) {
    return (
      <div className="login-screen">
        <h1>僵尸生存者</h1>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="输入你的名字"
        />
        <button onClick={handleJoin}>开始游戏</button>
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
