import React from 'react';
import { useUser } from '@/context/UserContext';
import { useGame } from '@/context/GameContext';
import { StatCard } from '@/components/StatCard';
import { PlatformGame } from '@/components/PlatformGame';
import { Target } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { gameHistory } = useGame();
  const { user } = useUser();
  
  const totalGames = gameHistory.length;
  const completedGames = gameHistory.filter(game => game.status === 'completed').length;
  const averageScore = gameHistory.length > 0 
    ? Math.round(gameHistory.reduce((sum, game) => sum + game.finalScore, 0) / gameHistory.length)
    : 0;
  const highestScore = gameHistory.length > 0 
    ? Math.max(...gameHistory.map(game => game.finalScore))
    : 0;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Platform Game - Tela Cheia para Totem */}
      <PlatformGame />
    </div>
  );
};