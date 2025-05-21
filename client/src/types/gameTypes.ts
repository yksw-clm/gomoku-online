export type CellValue = 0 | 1 | 2; // 0: 空, 1: 黒, 2: 白
export type BoardState = CellValue[][];
export type PlayerColor = "black" | "white";

export interface Player {
  name: string;
  color: PlayerColor;
}

export interface GameState {
  id: string;
  board: BoardState;
  currentPlayer: Player;
  players: Player[];
  isGameOver: boolean;
  winner: Player | null;
  lastMove: { row: number; col: number } | null;
}

export interface WaitingGame {
  id: string;
  creator: string;
}

export interface TimerState {
  timeRemaining: number;
  playerName: string;
}
