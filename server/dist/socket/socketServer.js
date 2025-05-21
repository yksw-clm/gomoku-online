"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketServer = void 0;
const socket_io_1 = require("socket.io");
const gameHandlers_1 = require("./handlers/gameHandlers");
const connectionHandlers_1 = require("./handlers/connectionHandlers");
const setupSocketServer = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.NODE_ENV === "production" ? false : "*",
            methods: ["GET", "POST"],
            credentials: true,
        },
        path: "/socket.io", // 明示的にパスを設定
    });
    // ハンドラーの設定
    (0, connectionHandlers_1.setupConnectionHandlers)(io);
    (0, gameHandlers_1.setupGameHandlers)(io);
    return io;
};
exports.setupSocketServer = setupSocketServer;
