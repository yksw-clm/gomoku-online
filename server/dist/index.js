"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const socketServer_1 = require("./socket/socketServer");
const dotenv_1 = __importDefault(require("dotenv"));
// 環境変数の読み込み
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// ミドルウェアの設定
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === "production" ? false : "*",
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 静的ファイルの提供
// public ディレクトリを静的ファイル用ディレクトリとして設定
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
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
    res.sendFile(path_1.default.join(__dirname, "../public/index.html"));
});
// HTTPサーバーの作成
const server = http_1.default.createServer(app);
// Socket.IOサーバーの設定
const io = (0, socketServer_1.setupSocketServer)(server);
// サーバー起動
server.listen(PORT, () => {
    console.log(`五目並べゲームサーバーが http://localhost:${PORT} で起動しました`);
});
