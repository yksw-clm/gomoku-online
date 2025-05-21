import { useEffect } from "react";
import { useGame } from "../contexts/GameContext";
import {
  Container,
  Title,
  Button,
  Card,
  Message,
} from "../styles/commonStyles";
import { getSocket } from "../services/socketService";
import styled from "styled-components";

const GameList = styled.div`
  margin-top: 20px;
`;

const GameItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
`;

function Lobby() {
  const {
    playerName,
    waitingGames,
    createGame,
    joinGame,
    cancelGame,
    message,
  } = useGame();

  // 自分が作成したゲームを持っているかどうか
  const hasCreatedGame = waitingGames.some(
    (game) => game.creator === playerName
  );

  // 初期ロード時に待機中ゲーム一覧を取得
  useEffect(() => {
    const socket = getSocket();
    socket.emit("getWaitingGames");
  }, []);

  return (
    <Container>
      <Card>
        <Title>ゲームロビー</Title>
        <p>ようこそ {playerName} さん！</p>

        <ButtonGroup>
          <Button onClick={createGame} disabled={hasCreatedGame}>
            新しいゲームを作成
          </Button>
          {hasCreatedGame && (
            <Button onClick={cancelGame}>作成したゲームをキャンセル</Button>
          )}
        </ButtonGroup>

        {message && <Message>{message}</Message>}

        <GameList>
          <h3>参加できるゲーム:</h3>
          {waitingGames.length === 0 ? (
            <p>現在、参加できるゲームはありません。</p>
          ) : (
            waitingGames.map((game) => (
              <GameItem key={game.id}>
                <span>{game.creator}のゲーム</span>
                {game.creator !== playerName && (
                  <Button onClick={() => joinGame(game.id)}>参加する</Button>
                )}
                {game.creator === playerName && (
                  <span>あなたが作成したゲームです</span>
                )}
              </GameItem>
            ))
          )}
        </GameList>
      </Card>
    </Container>
  );
}

export default Lobby;
