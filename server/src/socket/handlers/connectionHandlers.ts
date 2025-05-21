import { Server, Socket } from "socket.io";

// 接続中のユーザーを管理
const connectedUsers = new Map<string, { socketId: string; name: string }>();

// ユーザーとそのソケットIDのマッピングを追加（逆引きできるようにする）
const userSocketMapping = new Map<string, string>(); // ユーザー名 -> socketId

export const setupConnectionHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`New client connected: ${socket.id}`);

    // ユーザー登録処理
    socket.on("registerUser", (userData: { name: string }) => {
      connectedUsers.set(socket.id, {
        socketId: socket.id,
        name: userData.name,
      });

      // 名前からソケットIDを逆引きできるようにマッピングを追加
      userSocketMapping.set(userData.name, socket.id);

      socket.emit("userRegistered", { id: socket.id, name: userData.name });

      // オンラインユーザーのリストを更新
      broadcastOnlineUsers(io);
    });

    // 切断時の処理
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);

      // ユーザー名を取得
      let disconnectedUser = null;
      if (connectedUsers.has(socket.id)) {
        disconnectedUser = connectedUsers.get(socket.id);
        connectedUsers.delete(socket.id);

        if (disconnectedUser) {
          // 逆引きマッピングからも削除
          userSocketMapping.delete(disconnectedUser.name);
        }

        broadcastOnlineUsers(io);
      }

      // ここでクリーンアップ処理をトリガー
      if (disconnectedUser) {
        // 外部から呼び出せるようにするため、cleanupPlayerGamesのメソッドをエクスポート
        // このメソッドは gameHandlers.ts に実装する
        const { cleanupPlayerGames } = require("./gameHandlers");
        cleanupPlayerGames(io, disconnectedUser.name);
      }
    });
  });
};

// オンラインユーザーの一覧を全クライアントに送信
const broadcastOnlineUsers = (io: Server) => {
  const users = Array.from(connectedUsers.values());
  io.emit("onlineUsers", { users });
};

// 他のハンドラーからアクセスできるよう公開
export const getConnectedUsers = () => {
  return connectedUsers;
};

// ユーザー名からSocketIDを取得する関数を追加
export const getSocketIdByUsername = (username: string): string | undefined => {
  return userSocketMapping.get(username);
};
