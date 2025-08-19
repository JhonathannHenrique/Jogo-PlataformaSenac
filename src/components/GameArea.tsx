import React, { useEffect, useState, useCallback } from 'react';
import { GameItem, GameStats, GameState } from '@/types/game';
import { Target, Star } from 'lucide-react';

interface GameAreaProps {
  gameStats: GameStats;
  onScoreUpdate: (newStats: GameStats) => void;
  gameState: GameState;
  onGameStateChange: (state: Partial<GameState>) => void;
}

export const GameArea: React.FC<GameAreaProps> = ({
  gameStats,
  onScoreUpdate,
  gameState,
  onGameStateChange
}) => {
  const [areaSize, setAreaSize] = useState({ width: 600, height: 400 });

  // Calculate game difficulty based on level
  const getSpawnInterval = (level: number) => Math.max(500, 2000 - (level * 200));
  const getItemLifetime = (level: number) => Math.max(800, 2000 - (level * 150));

  const createRandomItem = useCallback((): GameItem => {
    const margin = 50;
    return {
      id: Date.now().toString() + Math.random(),
      x: margin + Math.random() * (areaSize.width - margin * 2),
      y: margin + Math.random() * (areaSize.height - margin * 2),
      type: Math.random() > 0.8 ? 'bonus' : 'target'
    };
  }, [areaSize]);

  const handleItemClick = useCallback((itemId: string) => {
    const item = gameState.items.find(i => i.id === itemId);
    if (!item) return;

    const pointsToAdd = item.type === 'bonus' ? 200 : 100;
    const newScore = gameStats.currentScore + pointsToAdd;
    const newClicks = gameStats.levelClicks + 1;
    const newLevel = Math.floor(newScore / 500) + 1;

    // Update stats
    onScoreUpdate({
      ...gameStats,
      currentScore: newScore,
      levelClicks: newClicks,
      level: newLevel
    });

    // Remove clicked item with animation
    const clickedElement = document.querySelector(`[data-item-id="${itemId}"]`);
    if (clickedElement) {
      clickedElement.classList.add('clicked');
      setTimeout(() => {
        onGameStateChange({
          items: gameState.items.filter(i => i.id !== itemId)
        });
      }, 200);
    }

    // Check win condition
    if (newScore >= gameStats.targetScore) {
      onGameStateChange({ gameWon: true, isPlaying: false });
    }
  }, [gameState.items, gameStats, onScoreUpdate, onGameStateChange]);

  // Spawn items
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const spawnInterval = getSpawnInterval(gameStats.level);
    const interval = setInterval(() => {
      const newItem = createRandomItem();
      onGameStateChange({
        items: [...gameState.items, newItem]
      });
    }, spawnInterval);

    return () => clearInterval(interval);
  }, [gameState.isPlaying, gameStats.level, createRandomItem, gameState.items, onGameStateChange]);

  // Remove items after lifetime
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const itemLifetime = getItemLifetime(gameStats.level);
    
    gameState.items.forEach(item => {
      setTimeout(() => {
        onGameStateChange({
          items: gameState.items.filter(i => i.id !== item.id)
        });
      }, itemLifetime);
    });
  }, [gameState.items, gameState.isPlaying, gameStats.level, onGameStateChange]);

  // Update area size on mount
  useEffect(() => {
    const updateSize = () => {
      const container = document.getElementById('game-area-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        setAreaSize({
          width: Math.max(400, rect.width - 40),
          height: Math.max(300, rect.height - 40)
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div 
      id="game-area-container"
      className="w-full h-96 p-4"
    >
      <div 
        className="game-area w-full h-full relative"
        style={{ width: areaSize.width, height: areaSize.height }}
      >
        {gameState.isPlaying && (
          <>
            {gameState.items.map((item) => (
              <div
                key={item.id}
                data-item-id={item.id}
                className="game-item absolute w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
                style={{
                  left: item.x,
                  top: item.y,
                  background: item.type === 'bonus' ? 'var(--gradient-secondary)' : 'var(--gradient-primary)'
                }}
                onClick={() => handleItemClick(item.id)}
              >
                {item.type === 'bonus' ? (
                  <Star className="w-6 h-6 text-white" />
                ) : (
                  <Target className="w-6 h-6 text-white" />
                )}
              </div>
            ))}
          </>
        )}
        
        {!gameState.isPlaying && !gameState.gameWon && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-muted-foreground mb-2">
                Área de Jogo
              </h3>
              <p className="text-muted-foreground">
                Clique em "Iniciar Jogo" para começar!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};