import { Server, Socket } from "socket.io";
import { Game } from "../../game/Game";
import { Player } from "../../game/Player";
import { v4 as uuidv4 } from "uuid";
import { getConnectedUsers, getSocketIdByUsername } from "./connectionHandlers";

// アクティブなゲームを管理
const activeGames = new Map<string, Game>();
// 待機中のゲームIDを保存
const waitingGames: string[] = [];
// ユーザーごとに作成したゲームを記録
const userCreatedGames = new Map<string, string>();
// タイマーを保存
const gameTimers = new Map<string, NodeJS.Timeout>();

// タイマーの時間（ミリ秒）
const MOVE_TIME_LIMIT = 30000; // 30秒

export const cleanupPlayerGames = (io: Server, playerName: string) => {
  // 切断したプレイヤーが作成者のゲームを検索して削除
  waitingGames.forEach((gameId) => {
    const game = activeGames.get(gameId);
    if (game && game.players[0].name === playerName) {
      // 待機中のゲームを削除
      const index = waitingGames.indexOf(gameId);
      if (index !== -1) {
        waitingGames.splice(index, 1);
      }
      activeGames.delete(gameId);
    }
  });

  // プレイヤーが作成したゲームの記録を削除
  userCreatedGames.delete(playerName);

  // 対戦中のゲームも確認
  activeGames.forEach((game, gameId) => {
    // プレイヤーがゲームに参加していれば、相手に通知して終了
    const isPlayerInGame = game.players.some(
      (player) => player.name === playerName
    );
    if (isPlayerInGame) {
      // タイマーがあれば削除
      if (gameTimers.has(gameId)) {
        clearTimeout(gameTimers.get(gameId));
        gameTimers.delete(gameId);
      }

      io.to(gameId).emit("playerDisconnected", {
        message: `${playerName}が切断しました。ゲームを終了します。`,
        gameState: game.getGameState(),
      });

      // ルームから全員を退出させる
      io.socketsLeave(gameId);

      // 待機中のゲーム一覧から削除
      const index = waitingGames.indexOf(gameId);
      if (index !== -1) {
        waitingGames.splice(index, 1);
      }

      // ゲームを削除
      activeGames.delete(gameId);
    }
  });

  // 待機ゲーム一覧を更新
  broadcastWaitingGames(io);
};

// タイマーのセットアップ関数
const setupMoveTimer = (io: Server, gameId: string) => {
  // 既存のタイマーがあればクリア
  if (gameTimers.has(gameId)) {
    clearTimeout(gameTimers.get(gameId));
  }

  const game = activeGames.get(gameId);
  if (!game) return;

  const timer = setTimeout(() => {
    const currentPlayer = game.getCurrentPlayer();
    const otherPlayerIndex = game.players.findIndex(
      (p) => p.name !== currentPlayer.name
    );

    if (otherPlayerIndex >= 0) {
      const winner = game.players[otherPlayerIndex];

      // タイムアウトで負け
      io.to(gameId).emit("gameOver", {
        winner: winner.name,
        reason: "timeout",
        message: `${currentPlayer.name}の時間切れです。${winner.name}の勝利です！`,
        gameState: game.getGameState(),
      });

      // ゲームを削除
      activeGames.delete(gameId);
      gameTimers.delete(gameId);
    }
  }, MOVE_TIME_LIMIT);

  gameTimers.set(gameId, timer);
};

export const setupGameHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    // 新しいゲームを作成
    socket.on("createGame", (data: { playerName: string }) => {
      const { playerName } = data;

      // 既に部屋を作成済みの場合は作成できない
      if (userCreatedGames.has(playerName)) {
        socket.emit("error", {
          message: "既に部屋を作成済みです。同時に複数の部屋は作成できません。",
        });
        return;
      }

      const gameId = uuidv4();
      const player = new Player(playerName, "black"); // 先手は黒
      const game = new Game(gameId, player);

      activeGames.set(gameId, game);
      waitingGames.push(gameId);

      // ユーザーとゲームの関連を記録
      userCreatedGames.set(playerName, gameId);

      // ゲームルームに参加
      socket.join(gameId);

      // 作成者にゲーム情報を返す
      socket.emit("gameCreated", {
        gameId,
        player,
        message: "五目並べゲームを作成しました。対戦相手を待っています。",
      });

      // 待機中のゲーム一覧を更新
      broadcastWaitingGames(io);
    });

    // ゲームに参加
    socket.on("joinGame", (data: { gameId: string; playerName: string }) => {
      const { gameId, playerName } = data;
      const game = activeGames.get(gameId);

      if (!game) {
        socket.emit("error", { message: "ゲームが見つかりません。" });
        return;
      }

      if (game.hasEnoughPlayers()) {
        socket.emit("error", { message: "ゲームはすでに満員です。" });
        return;
      }

      // 自分で作ったゲームに参加できないようにする
      if (game.players[0].name === playerName) {
        socket.emit("error", {
          message: "自分で作成したゲームには参加できません。",
        });
        return;
      }

      // 2人目のプレイヤーは白（後手）
      const player = new Player(playerName, "white");
      game.addPlayer(player);

      // ゲームルームに参加
      socket.join(gameId);

      // 待機リストから削除
      const index = waitingGames.indexOf(gameId);
      if (index !== -1) {
        waitingGames.splice(index, 1);
      }

      // 参加者にゲーム情報を返す
      socket.emit("gameJoined", {
        gameId,
        player,
        message: "五目並べゲームに参加しました。",
      });

      // 全プレイヤーにゲーム開始を通知
      io.to(gameId).emit("gameStarted", game.getGameState());

      // 待機中のゲーム一覧を更新
      broadcastWaitingGames(io);

      // タイマー開始
      setupMoveTimer(io, gameId);

      // ゲーム開始時に制限時間を通知
      io.to(gameId).emit("timerUpdate", {
        timeRemaining: MOVE_TIME_LIMIT / 1000, // 秒単位で送信
        playerName: game.getCurrentPlayer().name,
      });
    });

    // 待機中のゲーム一覧をリクエスト
    socket.on("getWaitingGames", () => {
      const games = waitingGames.map((gameId) => {
        const game = activeGames.get(gameId);
        return {
          id: gameId,
          creator: game?.players[0].name,
        };
      });

      socket.emit("waitingGames", { games });
    });

    // 手を打つ
    socket.on(
      "makeMove",
      (data: { gameId: string; move: { row: number; col: number } }) => {
        const { gameId, move } = data;
        const game = activeGames.get(gameId);

        if (!game) {
          socket.emit("error", { message: "ゲームが見つかりません。" });
          return;
        }

        // 手が有効かチェック
        const result = game.playMove(move);
        if (result) {
          // タイマーをリセット
          if (gameTimers.has(gameId)) {
            clearTimeout(gameTimers.get(gameId));
          }

          // 全プレイヤーに状態を通知
          io.to(gameId).emit("gameUpdated", game.getGameState());

          // 勝利判定
          if (game.checkWin()) {
            const winner = game.getWinner();
            io.to(gameId).emit("gameOver", {
              winner: winner?.name,
              gameState: game.getGameState(),
            });

            // ゲームを削除
            activeGames.delete(gameId);
            // ユーザー作成ゲームの記録を削除
            game.players.forEach((player) => {
              userCreatedGames.delete(player.name);
            });
          }
          // 引き分け判定
          else if (game.isGameOver()) {
            io.to(gameId).emit("gameOver", {
              winner: "引き分け",
              gameState: game.getGameState(),
            });

            // ゲームを削除
            activeGames.delete(gameId);
            // ユーザー作成ゲームの記録を削除
            game.players.forEach((player) => {
              userCreatedGames.delete(player.name);
            });
          } else {
            // 次のプレイヤーのタイマーを開始
            setupMoveTimer(io, gameId);

            // 残り時間通知
            io.to(gameId).emit("timerUpdate", {
              timeRemaining: MOVE_TIME_LIMIT / 1000, // 秒単位
              playerName: game.getCurrentPlayer().name,
            });
          }
        } else {
          socket.emit("invalidMove", { message: "無効な手です。" });
        }
      }
    );

    // ゲームを降参する
    socket.on("forfeitGame", (data: { gameId: string; playerId: string }) => {
      const { gameId, playerId } = data;
      const game = activeGames.get(gameId);

      if (game) {
        // タイマーのクリア
        if (gameTimers.has(gameId)) {
          clearTimeout(gameTimers.get(gameId));
          gameTimers.delete(gameId);
        }

        // 降参したプレイヤーの対戦相手を勝者として特定
        const winner = game.players.find((player) => player.name !== playerId);

        io.to(gameId).emit("playerForfeit", {
          message: `${playerId}が降参しました。${
            winner ? winner.name + "の勝ちです。" : ""
          }`,
          winner: winner?.name,
          gameState: game.getGameState(),
        });

        // ゲームを削除
        activeGames.delete(gameId);

        // ユーザー作成ゲームの記録を削除
        game.players.forEach((player) => {
          userCreatedGames.delete(player.name);
        });

        // 待機ゲーム一覧から削除
        const index = waitingGames.indexOf(gameId);
        if (index !== -1) {
          waitingGames.splice(index, 1);
          broadcastWaitingGames(io);
        }
      }
    });

    // ロビーに戻る
    socket.on(
      "returnToLobby",
      (data: { playerName: string; gameId: string }) => {
        const { playerName, gameId } = data;

        // ゲームIDが有効な場合はソケットをゲームルームから外す
        if (gameId) {
          socket.leave(gameId);
        }

        // ユーザー作成ゲームの記録を削除
        userCreatedGames.delete(playerName);

        // ロビーのゲーム一覧を更新
        socket.emit("returnedToLobby");
        socket.emit("getWaitingGames");
      }
    );

    // 新しいイベントハンドラ：部屋のキャンセル
    socket.on("cancelGame", (data: { gameId: string; playerName: string }) => {
      const { gameId, playerName } = data;
      const game = activeGames.get(gameId);

      if (!game) {
        socket.emit("error", { message: "ゲームが見つかりません。" });
        return;
      }

      // 部屋の作成者かどうかをチェック
      if (game.players[0].name !== playerName) {
        socket.emit("error", {
          message: "部屋の作成者のみがキャンセルできます。",
        });
        return;
      }

      // 既にプレイヤーが2人いる場合はキャンセルできない
      if (game.hasEnoughPlayers()) {
        socket.emit("error", {
          message: "既にゲームが開始されているためキャンセルできません。",
        });
        return;
      }

      // ゲームを待機リストから削除
      const index = waitingGames.indexOf(gameId);
      if (index !== -1) {
        waitingGames.splice(index, 1);
      }

      // アクティブなゲームから削除
      activeGames.delete(gameId);

      // ユーザーとゲームの関連を削除
      userCreatedGames.delete(playerName);

      // ゲームルームから退出
      socket.leave(gameId);

      // 作成者にキャンセル成功を通知
      socket.emit("gameCancelled", {
        message: "ゲームをキャンセルしました。",
      });

      // 待機中のゲーム一覧を更新
      broadcastWaitingGames(io);
    });
  });
};

// 待機中のゲーム一覧を全クライアントに送信
const broadcastWaitingGames = (io: Server) => {
  const games = waitingGames.map((gameId) => {
    const game = activeGames.get(gameId);
    return {
      id: gameId,
      creator: game?.players[0].name,
    };
  });

  io.emit("waitingGames", { games });
};
