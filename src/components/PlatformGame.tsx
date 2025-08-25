import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { useUser } from '@/context/UserContext';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
}

interface Player {
  x: number;
  y: number;
  radius: number;
  velocityY: number;
  onGround: boolean;
}

export const PlatformGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { addGameResult } = useGame();
  const { user } = useUser();
  
  const [gameState, setGameState] = useState({
    isPlaying: false,
    isPaused: false,
    gameWon: false,
    score: 0,
    maxScore: parseInt(localStorage.getItem('maxScore') || '0'),
    gameSpeed: 0.50, // Velocidade inicial 50% menor
    platformsReached: 0, // Contador de plataformas para controle de velocidade
    countdown: 0, // Countdown antes de começar
    isCountingDown: false,
  });

  const gameDataRef = useRef({
    player: { x: 400, y: 500, radius: 15, velocityY: 0, onGround: false } as Player,
    platforms: [] as Platform[],
    camera: { y: 0 },
    keys: { left: false, right: false },
    lastPlatformId: '',
    touchStartX: 0,
    isTouching: false,
  });

  const CANVAS_WIDTH = 480;  // Formato vertical para totem
  const CANVAS_HEIGHT = 800;
  const PLATFORM_WIDTH = 100;
  const PLATFORM_HEIGHT = 20;
  const GRAVITY = 0.85;
  const JUMP_FORCE = -23;
  const PLAYER_SPEED = 3;
  const TARGET_SCORE = 3000;

  // Initialize platforms
  const initializePlatforms = useCallback(() => {
    const platforms: Platform[] = [];
    
    // Starting platform
    platforms.push({
      x: CANVAS_WIDTH / 2 - PLATFORM_WIDTH / 2,
      y: CANVAS_HEIGHT - 100,
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
      id: 'start'
    });

    // Generate initial platforms
    for (let i = 1; i < 20; i++) {
      platforms.push({
        x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
        y: CANVAS_HEIGHT - 100 - (i * 80),
        width: PLATFORM_WIDTH,
        height: PLATFORM_HEIGHT,
        id: `platform-${i}`
      });
    }
    
    gameDataRef.current.platforms = platforms;
  }, []);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'ArrowLeft') {
      gameDataRef.current.keys.left = true;
    }
    if (e.code === 'ArrowRight') {
      gameDataRef.current.keys.right = true;
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'ArrowLeft') {
      gameDataRef.current.keys.left = false;
    }
    if (e.code === 'ArrowRight') {
      gameDataRef.current.keys.right = false;
    }
  }, []);

  // Handle touch input
  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    
    gameDataRef.current.touchStartX = touchX;
    gameDataRef.current.isTouching = true;
    
    if (touchX < CANVAS_WIDTH / 2) {
      gameDataRef.current.keys.left = true;
      gameDataRef.current.keys.right = false;
    } else {
      gameDataRef.current.keys.right = true;
      gameDataRef.current.keys.left = false;
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    gameDataRef.current.keys.left = false;
    gameDataRef.current.keys.right = false;
    gameDataRef.current.isTouching = false;
  }, []);

  // Handle mouse input
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState.isPlaying) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Convert mouse position to player position
    const playerX = (mouseX / CANVAS_WIDTH) * CANVAS_WIDTH;
    
    // Keep player within bounds
    const clampedX = Math.max(gameDataRef.current.player.radius, 
                             Math.min(CANVAS_WIDTH - gameDataRef.current.player.radius, playerX));
    
    gameDataRef.current.player.x = clampedX;
  }, [gameState.isPlaying]);

  // Countdown logic
  const startCountdown = useCallback(() => {
    if (!user) return;

    setGameState(prev => ({ ...prev, isCountingDown: true, countdown: 3 }));
    
    const countdownInterval = setInterval(() => {
      setGameState(prev => {
        if (prev.countdown <= 1) {
          clearInterval(countdownInterval);
          // Start the actual game
          setTimeout(() => {
            gameDataRef.current.player = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 150, radius: 15, velocityY: 0, onGround: false };
            gameDataRef.current.camera = { y: 0 };
            gameDataRef.current.lastPlatformId = '';
            
            initializePlatforms();
            
            setGameState(prev => ({
              ...prev,
              isPlaying: true,
              isPaused: false,
              gameWon: false,
              score: 0,
              gameSpeed: 0.25,
              platformsReached: 0,
              isCountingDown: false,
              countdown: 0,
            }));
          }, 100);
          return prev;
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
  }, [user, initializePlatforms]);

  // Game physics and collision detection
  const updateGame = useCallback(() => {
    const { player, platforms, camera, keys } = gameDataRef.current;
    
    // Player movement
    if (keys.left && player.x > player.radius) {
      player.x -= PLAYER_SPEED;
    }
    if (keys.right && player.x < CANVAS_WIDTH - player.radius) {
      player.x += PLAYER_SPEED;
    }

    // Apply gravity
    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    // Platform collision detection
    player.onGround = false;
    for (const platform of platforms) {
      if (player.x + player.radius > platform.x &&
          player.x - player.radius < platform.x + platform.width &&
          player.y + player.radius > platform.y &&
          player.y + player.radius < platform.y + platform.height + 10 &&
          player.velocityY > 0) {
        
        // Landing on platform
        player.y = platform.y - player.radius;
        player.velocityY = JUMP_FORCE;
        player.onGround = true;

        // Score only if it's a new platform
        if (platform.id !== gameDataRef.current.lastPlatformId && platform.id !== 'start') {
          setGameState(prev => ({ 
            ...prev, 
            score: prev.score + 30,
            platformsReached: prev.platformsReached + 1 
          }));
          gameDataRef.current.lastPlatformId = platform.id;
        }
        break;
      }
    }

    // Move camera to follow player
    const targetCameraY = player.y - CANVAS_HEIGHT / 2;
    camera.y = Math.min(camera.y, targetCameraY);

    // Move platforms down (create scrolling effect)
    const speed = gameState.gameSpeed;
    platforms.forEach(platform => {
      platform.y += speed;
    });

    // Generate new platforms at the top
    const highestPlatform = Math.min(...platforms.map(p => p.y));
    if (highestPlatform > camera.y - 200) {
      for (let i = 0; i < 3; i++) {
        platforms.push({
          x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
          y: highestPlatform - 80 - (i * 80),
          width: PLATFORM_WIDTH,
          height: PLATFORM_HEIGHT,
          id: `platform-${Date.now()}-${i}`
        });
      }
    }

    // Remove platforms that are too far below
    gameDataRef.current.platforms = platforms.filter(p => p.y < camera.y + CANVAS_HEIGHT + 100);

    // Check if player fell off screen
    if (player.y > camera.y + CANVAS_HEIGHT + 100) {
      endGame();
    }

    // Update game speed based on platforms reached (muito mais gradual)
    const newSpeed = 0.25 + Math.floor(gameState.platformsReached / 12) * 0.05;
    setGameState(prev => ({ ...prev, gameSpeed: newSpeed }));

    // Check victory condition
    if (gameState.score >= TARGET_SCORE && !gameState.gameWon) {
      setGameState(prev => ({ ...prev, gameWon: true, isPlaying: false }));
      saveGameResult(true);
      toast.success("Parabéns! Você alcançou a meta de 3000 pontos!");
    }
  }, [gameState.score, gameState.gameSpeed, gameState.gameWon]);

  // Render game
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { player, platforms, camera } = gameDataRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Save context for camera transform
    ctx.save();
    ctx.translate(0, -camera.y);

    // Draw platforms
    ctx.fillStyle = '#4a5568';
    platforms.forEach(platform => {
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw player
    ctx.fillStyle = '#f56565';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
    ctx.fill();

    // Restore context
    ctx.restore();

    // Draw UI elements (fixed position)
    ctx.fillStyle = '#2d3748';
    ctx.font = '16px Arial';
    ctx.fillText(`Pontuação: ${gameState.score}`, 10, 30);
    ctx.fillText(`Velocidade: ${gameState.gameSpeed.toFixed(1)}x`, 10, 50);
  }, [gameState.score, gameState.gameSpeed]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      updateGame();
      render();
    }
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isPlaying, gameState.isPaused, updateGame, render]);

  // Start game (now calls countdown instead)
  const startGame = useCallback(() => {
    startCountdown();
  }, [startCountdown]);

  // End game
  const endGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPlaying: false }));
    saveGameResult(false);
    toast.error(`Fim de jogo! Pontuação final: ${gameState.score}`);
  }, [gameState.score]);

  // Save game result
  const saveGameResult = useCallback((isVictory: boolean) => {
    if (!user) return;

    addGameResult({
      playerName: user.name,
      finalScore: gameState.score,
      date: new Date().toISOString(),
      status: isVictory ? 'completed' : 'incomplete',
      level: Math.floor(gameState.score / 500) + 1
    });

    // Update max score
    if (gameState.score > gameState.maxScore) {
      localStorage.setItem('maxScore', gameState.score.toString());
      setGameState(prev => ({ ...prev, maxScore: gameState.score }));
    }
  }, [user, gameState.score, gameState.maxScore, addGameResult]);

  // Setup event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
      canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchend', handleTouchEnd);
        canvas.removeEventListener('touchcancel', handleTouchEnd);
      }
    };
  }, [handleKeyDown, handleKeyUp, handleTouchStart, handleTouchEnd, handleMouseMove]);

  // Start game loop
  useEffect(() => {
    if (gameState.isPlaying) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.isPlaying, gameLoop]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-primary/5 to-secondary/5">
      {/* Header Stats - Compact para Totem */}
      <div className="p-4 bg-background/95 backdrop-blur-sm border-b">
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-xl font-bold text-primary">{gameState.score}</div>
            <div className="text-xs text-muted-foreground">Atual</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-secondary">{gameState.maxScore}</div>
            <div className="text-xs text-muted-foreground">Recorde</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-accent">{TARGET_SCORE}</div>
            <div className="text-xs text-muted-foreground">Meta</div>
          </div>
        </div>
      </div>

      {/* Game Area - Centralizado para Totem */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative border-2 border-primary/20 rounded-lg overflow-hidden shadow-2xl">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block bg-gradient-to-b from-sky-200 to-sky-100"
            style={{ touchAction: 'none' }}
          />
          
          {!gameState.isPlaying && !gameState.gameWon && !gameState.isCountingDown && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white p-6">
                <h3 className="text-3xl font-bold mb-4">Plataforma SENAC</h3>
                <p className="mb-4 text-lg">Use o mouse ou toque nas laterais da tela</p>
                <p className="mb-6">Pule nas plataformas e alcance 3000 pontos!</p>
                <Button onClick={startGame} size="lg" className="text-lg px-8 py-3">
                  {gameState.score > 0 ? 'Jogar Novamente' : 'Iniciar Jogo'}
                </Button>
              </div>
            </div>
          )}

          {/* Countdown overlay */}
          {gameState.isCountingDown && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-8xl font-bold mb-4 animate-pulse">
                  {gameState.countdown}
                </div>
                <p className="text-2xl">Preparar...</p>
              </div>
            </div>
          )}

          {gameState.gameWon && (
            <div className="absolute inset-0 bg-green-500/90 flex items-center justify-center">
              <div className="text-center text-white p-6">
                <h3 className="text-4xl font-bold mb-4">🎉 Parabéns!</h3>
                <p className="text-2xl mb-4">Você alcançou a meta!</p>
                <p className="text-xl mb-6">Pontuação Final: {gameState.score}</p>
                <Button onClick={startGame} size="lg" variant="secondary" className="text-lg px-8 py-3">
                  Jogar Novamente
                </Button>
              </div>
            </div>
          )}

          {/* Controles Touch Visuais - Apenas quando jogando */}
          {gameState.isPlaying && (
            <>
              {/* Indicador de Velocidade */}
              <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="text-white text-sm font-bold">
                  Velocidade: {gameState.gameSpeed.toFixed(1)}x
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer - Instruções para Totem */}
      <div className="p-4 bg-background/95 backdrop-blur-sm border-t">
        <div className="text-center text-sm text-muted-foreground max-w-md mx-auto">
          <p className="font-medium">🎮 CONTROLES TOUCHSCREEN</p>
          <p>Toque e segure nas laterais da tela</p>
        </div>
      </div>
    </div>
  );
};