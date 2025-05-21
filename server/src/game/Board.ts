export class Board {
  private board: number[][];
  private readonly size: number;
  // 方向ベクトル（8方向）
  private readonly directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  constructor(size: number = 15) {
    // 五目並べは通常15x15
    this.size = size;
    this.board = this.createInitialBoard();
  }

  private createInitialBoard(): number[][] {
    // 五目並べは最初は空の盤面
    return Array.from({ length: this.size }, () => Array(this.size).fill(0));
  }

  public getState(): number[][] {
    // ボードの状態を複製して返す（不変性を保つため）
    return this.board.map((row) => [...row]);
  }

  public isValidMove(row: number, col: number): boolean {
    // 盤面の範囲内かチェック
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
      return false;
    }

    // すでに石がある場合は無効
    return this.board[row][col] === 0;
  }

  public placePiece(
    color: "black" | "white",
    row: number,
    col: number
  ): boolean {
    const player = color === "black" ? 1 : 2;

    if (!this.isValidMove(row, col)) {
      return false;
    }

    // 石を配置
    this.board[row][col] = player;

    return true;
  }

  public isFull(): boolean {
    // ボードがすべて埋まっているかチェック
    return this.board.every((row) => row.every((cell) => cell !== 0));
  }

  public checkWin(row: number, col: number): boolean {
    const player = this.board[row][col];
    if (player === 0) return false;

    // 8方向それぞれについて5連続を確認
    for (const [dx, dy] of this.directions) {
      // 反対方向も含めて連続の石をカウント
      let count = 1; // 置いた石自体も含める

      // 片方の方向へカウント
      let r = row + dx;
      let c = col + dy;
      while (
        r >= 0 &&
        r < this.size &&
        c >= 0 &&
        c < this.size &&
        this.board[r][c] === player
      ) {
        count++;
        r += dx;
        c += dy;
      }

      // 反対方向へカウント
      r = row - dx;
      c = col - dy;
      while (
        r >= 0 &&
        r < this.size &&
        c >= 0 &&
        c < this.size &&
        this.board[r][c] === player
      ) {
        count++;
        r -= dx;
        c -= dy;
      }

      // 5つ以上連続していれば勝利
      if (count >= 5) {
        return true;
      }
    }

    return false;
  }
}
