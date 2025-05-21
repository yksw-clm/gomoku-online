import { io, Socket } from "socket.io-client";

// 開発環境か本番環境かで接続先を切り替え
const isDevelopment = import.meta.env.DEV;

// 開発環境ではフルURLを指定、本番環境では相対パスを使用
const SOCKET_SERVER_URL = isDevelopment
  ? "http://localhost:3000"
  : window.location.origin;

// シングルトンのソケットインスタンス
let socket: Socket | null = null;

// ソケット接続を取得または作成する
export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_SERVER_URL);
  }
  return socket;
};

// ソケット接続を閉じる
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
