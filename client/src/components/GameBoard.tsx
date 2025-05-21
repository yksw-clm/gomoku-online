import { useEffect, useRef } from "react";
// import { useGame } from "../contexts/GameContext";
import type { BoardState } from "../types/gameTypes";

interface GameBoardProps {
  board: BoardState;
  onCellClick: (row: number, col: number) => void;
  lastMove: { row: number; col: number } | null;
  isCurrentPlayer: boolean;
}

function GameBoard({
  board,
  onCellClick,
  lastMove,
  isCurrentPlayer,
}: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    // プレイヤーのターンでない場合はクリックを無効化
    if (!isCurrentPlayer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // クリックした位置を取得
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // クリックしたマスの行と列を計算
    const gridSize = 40;
    const row = Math.floor(y / gridSize);
    const col = Math.floor(x / gridSize);

    // 範囲外のクリックを無視
    if (row < 0 || row >= 15 || col < 0 || col >= 15) return;

    // 既に石が置かれている場合は何もしない
    if (board[row][col] !== 0) return;

    // 親コンポーネントにクリックイベントを通知
    onCellClick(row, col);
  };

  // 描画のためのuseEffect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 描画前に既に描画済みのものを消してリセット
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 背景色の描画
    ctx.fillStyle = "#E8C07D"; // 木の色に近い背景
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 15x15のマスを描画
    const gridSize = 40;
    ctx.strokeStyle = "#000"; // 線の色
    ctx.lineWidth = 1;

    for (let i = 0; i < 15; i++) {
      const pos = i * gridSize + gridSize / 2;

      // 縦の線
      ctx.beginPath();
      ctx.moveTo(pos, gridSize / 2);
      ctx.lineTo(pos, canvas.height - gridSize / 2);
      ctx.stroke();

      // 横の線
      ctx.beginPath();
      ctx.moveTo(gridSize / 2, pos);
      ctx.lineTo(canvas.width - gridSize / 2, pos);
      ctx.stroke();
    }

    // 石を描画
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        if (board[row][col] === 0) continue;

        const centerX = col * gridSize + gridSize / 2;
        const centerY = row * gridSize + gridSize / 2;
        const radius = gridSize / 2 - 2;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

        // 黒石と白石で色を変える
        if (board[row][col] === 1) {
          ctx.fillStyle = "#000"; // 黒
        } else if (board[row][col] === 2) {
          ctx.fillStyle = "#fff"; // 白
        }

        ctx.fill();
        ctx.stroke();
      }
    }

    // 最後に置かれた石をマーク
    if (lastMove) {
      const { row, col } = lastMove;
      const centerX = col * gridSize + gridSize / 2;
      const centerY = row * gridSize + gridSize / 2;
      const radius = 5;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = board[row][col] === 1 ? "#fff" : "#000"; // 反対色でマーク
      ctx.fill();
    }
  }, [board, lastMove]);

  return (
    <canvas
      ref={canvasRef}
      width={15 * 40}
      height={15 * 40}
      onClick={handleCanvasClick}
      style={{ cursor: isCurrentPlayer ? "pointer" : "default" }}
    ></canvas>
  );
}

export default GameBoard;
