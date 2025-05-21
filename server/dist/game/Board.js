"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Board = void 0;
class Board {
    constructor(size = 15) {
        // 方向ベクトル（8方向）
        this.directions = [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, -1],
            [0, 1],
            [1, -1],
            [1, 0],
            [1, 1],
        ];
        // 五目並べは通常15x15
        this.size = size;
        this.board = this.createInitialBoard();
    }
    createInitialBoard() {
        // 五目並べは最初は空の盤面
        return Array.from({ length: this.size }, () => Array(this.size).fill(0));
    }
    getState() {
        // ボードの状態を複製して返す（不変性を保つため）
        return this.board.map((row) => [...row]);
    }
    isValidMove(row, col) {
        // 盤面の範囲内かチェック
        if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
            return false;
        }
        // すでに石がある場合は無効
        return this.board[row][col] === 0;
    }
    placePiece(color, row, col) {
        const player = color === "black" ? 1 : 2;
        if (!this.isValidMove(row, col)) {
            return false;
        }
        // 石を配置
        this.board[row][col] = player;
        return true;
    }
    isFull() {
        // ボードがすべて埋まっているかチェック
        return this.board.every((row) => row.every((cell) => cell !== 0));
    }
    checkWin(row, col) {
        const player = this.board[row][col];
        if (player === 0)
            return false;
        // 8方向それぞれについて5連続を確認
        for (const [dx, dy] of this.directions) {
            // 反対方向も含めて連続の石をカウント
            let count = 1; // 置いた石自体も含める
            // 片方の方向へカウント
            let r = row + dx;
            let c = col + dy;
            while (r >= 0 &&
                r < this.size &&
                c >= 0 &&
                c < this.size &&
                this.board[r][c] === player) {
                count++;
                r += dx;
                c += dy;
            }
            // 反対方向へカウント
            r = row - dx;
            c = col - dy;
            while (r >= 0 &&
                r < this.size &&
                c >= 0 &&
                c < this.size &&
                this.board[r][c] === player) {
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
exports.Board = Board;
