import { GameProvider, useGame } from "./contexts/GameContext";
import Login from "./components/Login";
import Lobby from "./components/Lobby";
import GameRoom from "./components/GameRoom";

function AppContent() {
  const { isLoggedIn, currentGame, isInLobby } = useGame();

  // 未ログイン状態ならログイン画面
  if (!isLoggedIn) {
    return <Login />;
  }

  // ゲーム中なら、ゲームボードを表示
  if (currentGame) {
    return <GameRoom />;
  }

  // それ以外（ロビーにいる状態）ならロビー画面
  if (isInLobby) {
    return <Lobby />;
  }

  // デフォルト（通常ここには来ない）
  return <div>Loading...</div>;
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
