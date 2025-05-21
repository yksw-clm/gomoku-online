import { Server } from "socket.io";
import http from "http";
import { setupGameHandlers } from "./handlers/gameHandlers";
import { setupConnectionHandlers } from "./handlers/connectionHandlers";

export const setupSocketServer = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === "production" ? false : "*", // 本番環境では同一オリジンのみ許可
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io", // 明示的にパスを設定
  });

  // ハンドラーの設定
  setupConnectionHandlers(io);
  setupGameHandlers(io);

  return io;
};
