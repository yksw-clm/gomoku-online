import express from "express";
import http from "http";
import cors from "cors";
import path from "path";
import { setupSocketServer } from "./socket/socketServer";
import dotenv from "dotenv";

// 環境変数の読み込み
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェアの設定
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? false : "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイルの提供
// public ディレクトリを静的ファイル用ディレクトリとして設定
app.use(express.static(path.join(__dirname, "../public")));

// 簡単なヘルスチェックエンドポイント
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// SPAのためのルートフォールバック
// /api 以外のすべてのリクエストに対して index.html を返す
app.get("*", (req, res, next) => {
  // APIエンドポイントには適用しない
  if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
    return next();
  }
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// HTTPサーバーの作成
const server = http.createServer(app);

// Socket.IOサーバーの設定
const io = setupSocketServer(server);

// サーバー起動
server.listen(PORT, () => {
  console.log(
    `五目並べゲームサーバーが http://localhost:${PORT} で起動しました`
  );
});
