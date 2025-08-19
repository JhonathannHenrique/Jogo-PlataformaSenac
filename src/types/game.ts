export interface User {
  name: string;
  email: string;
  phone: string;
}

export interface GameStats {
  currentScore: number;
  level: number;
  targetScore: number;
  levelClicks: number;
}

export interface GameItem {
  id: string;
  x: number;
  y: number;
  type: 'target' | 'bonus';
}

export interface GameResult {
  id: string;
  playerName: string;
  finalScore: number;
  date: string;
  status: 'completed' | 'incomplete';
  level: number;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  gameWon: boolean;
  items: GameItem[];
  timeRemaining?: number;
}