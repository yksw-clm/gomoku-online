"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const Board_1 = require("./Board");
class Game {
    constructor(id, player1, player2) {
        this.lastMove = null;
        this.winner = null;
        this.id = id;
        this.board = new Board_1.Board(); // 15x15のボードが作成される
        // 1人または2人のプレイヤーでゲームを開始できるようにする
        if (player2) {
            this.players = [player1, player2];
        }
        else {
            this.players = [player1];
        }
        this.currentPlayerIndex = 0; // 黒（先手）から開始
    }
    addPlayer(player) {
        if (this.players.length >= 2) {
            return false;
        }
        this.players.push(player);
        return true;
    }
    hasEnoughPlayers() {
        return this.players.length === 2;
    }
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }
    playMove(move) {
        const currentPlayer = this.getCurrentPlayer();
        const isValidMove = this.board.placePiece(currentPlayer.color, move.row, move.col);
        if (isValidMove) {
            this.lastMove = move;
            // 勝敗判定して、勝者を保存する
            if (this.checkWin()) {
                this.winner = currentPlayer; // 勝者を現在のプレイヤーとして保存
            }
            else {
                // 勝利でなければターン切り替え
                this.switchTurn();
            }
        }
        return isValidMove;
    }
    switchTurn() {
        this.currentPlayerIndex =
            (this.currentPlayerIndex + 1) % this.players.length;
    }
    getBoardState() {
        return this.board.getState();
    }
    isGameOver() {
        return !!this.getWinner() || this.board.isFull();
    }
    // 勝敗判定を行う
    checkWin() {
        if (!this.lastMove)
            return false;
        return this.board.checkWin(this.lastMove.row, this.lastMove.col);
    }
    // 以下のメソッドを修正
    getWinner() {
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
    getGameState() {
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
exports.Game = Game;
