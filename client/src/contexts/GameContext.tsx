import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { getSocket } from "../services/socketService";
import type {
  // BoardState,
  GameState,
  Player,
  WaitingGame,
} from "../types/gameTypes";

interface GameContextType {
  playerName: string;
  setPlayerName: (name: string) => void;
  isLoggedIn: boolean;
  currentGame: GameState | null;
  waitingGames: WaitingGame[];
  createGame: () => void;
  joinGame: (gameId: string) => void;
  cancelGame: () => void;
  makeMove: (row: number, col: number) => void;
  forfeitGame: () => void;
  returnToLobby: () => void;
  message: string;
  isInLobby: boolean;
  timeRemaining: number;
  currentTimerPlayer: string | null;
}

// コンテキストの初期値
const GameContext = createContext<GameContextType>({
  playerName: "",
  setPlayerName: () => {},
  isLoggedIn: false,
  currentGame: null,
  waitingGames: [],
  createGame: () => {},
  joinGame: () => {},
  cancelGame: () => {},
  makeMove: () => {},
  forfeitGame: () => {},
  returnToLobby: () => {},
  message: "",
  isInLobby: false,
  timeRemaining: 30,
  currentTimerPlayer: null,
});

export const useGame = () => useContext(GameContext);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
  const [playerName, setPlayerName] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentGame, setCurrentGame] = useState<GameState | null>(null);
  const [waitingGames, setWaitingGames] = useState<WaitingGame[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isInLobby, setIsInLobby] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [currentTimerPlayer, setCurrentTimerPlayer] = useState<string | null>(
    null
  );

  useEffect(() => {
    const socket = getSocket();

    // ユーザー登録成功時
    socket.on("userRegistered", () => {
      setIsLoggedIn(true);
      setIsInLobby(true);
      socket.emit("getWaitingGames");
    });

    // エラーメッセージの受信
    socket.on("error", (data: { message: string }) => {
      setMessage(data.message);
    });

    // 待機中のゲーム一覧を受信
    socket.on("waitingGames", (data: { games: WaitingGame[] }) => {
      setWaitingGames(data.games);
    });

    // ゲームの作成成功時
    socket.on(
      "gameCreated",
      (data: { gameId: string; player: Player; message: string }) => {
        setMessage(data.message);
      }
    );

    // ゲーム参加成功時
    socket.on(
      "gameJoined",
      (data: { gameId: string; player: Player; message: string }) => {
        setMessage(data.message);
      }
    );

    // プレイヤーが切断した時の処理
    socket.on(
      "playerDisconnected",
      (data: { message: string; gameState: GameState }) => {
        setMessage(data.message);
        setCurrentGame(null);
        setIsInLobby(true);
        socket.emit("getWaitingGames");
      }
    );

    // ゲーム開始時
    socket.on("gameStarted", (gameState: GameState) => {
      setCurrentGame(gameState);
      setIsInLobby(false);
      setMessage("ゲームが開始されました。");
    });

    // ゲーム状態の更新
    socket.on("gameUpdated", (gameState: GameState) => {
      setCurrentGame(gameState);
    });

    // タイマーの更新
    socket.on(
      "timerUpdate",
      (data: { timeRemaining: number; playerName: string }) => {
        setTimeRemaining(data.timeRemaining);
        setCurrentTimerPlayer(data.playerName);
      }
    );

    // 無効な手を打った時
    socket.on("invalidMove", (data: { message: string }) => {
      setMessage(data.message);
    });

    // ゲーム終了時
    socket.on(
      "gameOver",
      (data: {
        winner: string | null;
        gameState: GameState;
        reason?: string;
        message?: string;
      }) => {
        setCurrentGame(data.gameState);

        if (data.message) {
          setMessage(data.message);
        } else if (data.winner === "引き分け") {
          setMessage("ゲームは引き分けで終了しました。");
        } else if (data.winner) {
          setMessage(`${data.winner}の勝利です！`);
        }
      }
    );

    // プレイヤーが降参した時
    socket.on(
      "playerForfeit",
      (data: { message: string; winner?: string; gameState: GameState }) => {
        setMessage(data.message);
      }
    );

    // ロビーに戻った時
    socket.on("returnedToLobby", () => {
      setCurrentGame(null);
      setIsInLobby(true);
    });

    // ゲームキャンセル時
    socket.on("gameCancelled", (data: { message: string }) => {
      setMessage(data.message);
      setIsInLobby(true);
      socket.emit("getWaitingGames");
    });

    return () => {
      socket.off("userRegistered");
      socket.off("error");
      socket.off("waitingGames");
      socket.off("gameCreated");
      socket.off("gameJoined");
      socket.off("playerDisconnected");
      socket.off("gameStarted");
      socket.off("gameUpdated");
      socket.off("timerUpdate");
      socket.off("invalidMove");
      socket.off("gameOver");
      socket.off("playerForfeit");
      socket.off("returnedToLobby");
      socket.off("gameCancelled");
    };
  }, []);

  // 部屋をキャンセルする関数
  const cancelGame = () => {
    if (!waitingGames.some((game) => game.creator === playerName)) return;

    const socket = getSocket();
    const gameToCancel = waitingGames.find(
      (game) => game.creator === playerName
    );

    if (gameToCancel) {
      socket.emit("cancelGame", {
        gameId: gameToCancel.id,
        playerName: playerName,
      });
    }
  };

  // タイマーのカウントダウン効果
  useEffect(() => {
    if (currentGame && !currentGame.isGameOver && currentTimerPlayer) {
      const intervalId = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 0) return 0;
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [currentGame, currentTimerPlayer]);

  // プレイヤー名を設定してサーバーに登録
  const handleSetPlayerName = (name: string) => {
    setPlayerName(name);
    if (name.trim()) {
      const socket = getSocket();
      socket.emit("registerUser", { name });
    }
  };

  // 新しいゲームを作成
  const createGame = () => {
    const socket = getSocket();
    socket.emit("createGame", { playerName });
  };

  // 既存のゲームに参加
  const joinGame = (gameId: string) => {
    const socket = getSocket();
    socket.emit("joinGame", { gameId, playerName });
  };

  // ゲーム内で石を置く
  const makeMove = (row: number, col: number) => {
    if (!currentGame) return;

    const socket = getSocket();
    socket.emit("makeMove", {
      gameId: currentGame.id,
      move: { row, col },
    });
  };

  // ゲームから降参する
  const forfeitGame = () => {
    if (!currentGame) return;

    const socket = getSocket();
    socket.emit("forfeitGame", {
      gameId: currentGame.id,
      playerId: playerName,
    });
  };

  // ロビーに戻る
  const returnToLobby = () => {
    const socket = getSocket();
    socket.emit("returnToLobby", {
      playerName,
      gameId: currentGame?.id || "",
    });
  };

  // コンテキストの値
  const value = {
    playerName,
    setPlayerName: handleSetPlayerName,
    isLoggedIn,
    currentGame,
    waitingGames,
    createGame,
    joinGame,
    makeMove,
    cancelGame,
    forfeitGame,
    returnToLobby,
    message,
    isInLobby,
    timeRemaining,
    currentTimerPlayer,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
