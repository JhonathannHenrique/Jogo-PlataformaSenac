import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GameResult } from '@/types/game';

interface GameContextType {
  gameHistory: GameResult[];
  addGameResult: (result: Omit<GameResult, 'id'>) => void;
  getFilteredHistory: (searchTerm: string) => GameResult[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameHistory, setGameHistory] = useState<GameResult[]>(() => {
    const savedHistory = localStorage.getItem('gameHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  const addGameResult = (result: Omit<GameResult, 'id'>) => {
    const newResult: GameResult = {
      ...result,
      id: Date.now().toString(),
    };
    
    const updatedHistory = [...gameHistory, newResult];
    setGameHistory(updatedHistory);
    localStorage.setItem('gameHistory', JSON.stringify(updatedHistory));
  };

  const getFilteredHistory = (searchTerm: string) => {
    if (!searchTerm) return gameHistory;
    return gameHistory.filter(result => 
      result.playerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <GameContext.Provider value={{
      gameHistory,
      addGameResult,
      getFilteredHistory
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};