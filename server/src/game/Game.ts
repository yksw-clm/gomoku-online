import { Player } from "./Player";
import { Board } from "./Board";

export class Game {
  private board: Board;
  public players: Player[];
  private currentPlayerIndex: number;
  public id: string; // ゲームID
  private lastMove: { row: number; col: number } | null = null;

  private winner: Player | null = null;

  constructor(id: string, player1: Player, player2?: Player) {
    this.id = id;
    this.board = new Board(); // 15x15のボードが作成される

    // 1人または2人のプレイヤーでゲームを開始できるようにする
    if (player2) {
      this.players = [player1, player2];
    } else {
      this.players = [player1];
    }

    this.currentPlayerIndex = 0; // 黒（先手）から開始
  }

  public addPlayer(player: Player): boolean {
    if (this.players.length >= 2) {
      return false;
    }

    this.players.push(player);
    return true;
  }

  public hasEnoughPlayers(): boolean {
    return this.players.length === 2;
  }

  public getCurrentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }

  public playMove(move: { row: number; col: number }): boolean {
    const currentPlayer = this.getCurrentPlayer();
    const isValidMove = this.board.placePiece(
      currentPlayer.color,
      move.row,
      move.col
    );

    if (isValidMove) {
      this.lastMove = move;

      // 勝敗判定して、勝者を保存する
      if (this.checkWin()) {
        this.winner = currentPlayer; // 勝者を現在のプレイヤーとして保存
      } else {
        // 勝利でなければターン切り替え
        this.switchTurn();
      }
    }

    return isValidMove;
  }

  private switchTurn(): void {
    this.currentPlayerIndex =
      (this.currentPlayerIndex + 1) % this.players.length;
  }

  public getBoardState(): number[][] {
    return this.board.getState();
  }

  public isGameOver(): boolean {
    return !!this.getWinner() || this.board.isFull();
  }

  // 勝敗判定を行う
  public checkWin(): boolean {
    if (!this.lastMove) return false;
    return this.board.checkWin(this.lastMove.row, this.lastMove.col);
  }

  // 以下のメソッドを修正
  public getWinner(): Player | null {
    // 勝者が設定されていればそれを返す
    if (this.winner) {
      return this.winner;
    }

    // 引き分け（ボードが埋まっていて勝者がいない）
    if (this.board.isFull()) {
      return null;
    }

    return null; // まだゲーム継続中
  }

  public getGameState() {
    const winner = this.getWinner();

    return {
      id: this.id,
      board: this.board.getState(),
      currentPlayer: this.getCurrentPlayer(),
      players: this.players,
      isGameOver: this.isGameOver(),
      winner: winner,
      lastMove: this.lastMove,
    };
  }
}
