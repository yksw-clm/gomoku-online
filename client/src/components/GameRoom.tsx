import { useGame } from "../contexts/GameContext";
import GameBoard from "./GameBoard";
import audioService from "../services/audioService";
import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Button,
  Card,
  Message,
  GameInfoContainer,
  BoardContainer,
  PlayerInfo,
} from "../styles/commonStyles";
import styled from "styled-components";

// 新しいスタイル
const TimerContainer = styled.div`
  background-color: ${(props) => props.color || "#f5f5f5"};
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
  text-align: center;
  font-size: 1.2em;
  font-weight: bold;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const SoundToggle = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;

  label {
    margin-left: 8px;
  }
`;

function GameRoom() {
  const {
    currentGame,
    playerName,
    makeMove,
    forfeitGame,
    returnToLobby,
    message,
    timeRemaining,
    currentTimerPlayer,
  } = useGame();

  // 音声のオン/オフ状態
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 音声設定の切り替え
  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    audioService.setEnabled(newState);
  };

  // 前回のゲーム状態を保持するためのref
  const [prevGameState, setPrevGameState] = useState<any>(null);

  // ゲーム開始時に音を鳴らす
  useEffect(() => {
    if (currentGame && !prevGameState) {
      audioService.playSound("start");
    }
    setPrevGameState(currentGame);
  }, [currentGame]);

  // 石を置いた時の効果音
  useEffect(() => {
    if (
      currentGame &&
      prevGameState &&
      currentGame.lastMove &&
      (!prevGameState.lastMove ||
        prevGameState.lastMove.row !== currentGame.lastMove.row ||
        prevGameState.lastMove.col !== currentGame.lastMove.col)
    ) {
      audioService.playSound("stone");
    }
  }, [currentGame?.lastMove]);

  // ゲーム終了時の音
  useEffect(() => {
    if (currentGame?.isGameOver && prevGameState && !prevGameState.isGameOver) {
      if (!currentGame.winner) {
        audioService.playSound("draw");
      } else if (currentGame.winner.name === playerName) {
        audioService.playSound("win");
      } else {
        audioService.playSound("lose");
      }
    }
  }, [currentGame?.isGameOver, playerName]);

  if (!currentGame) {
    return <div>ゲームが読み込まれていません。</div>;
  }

  const { board, currentPlayer, players, isGameOver, winner } = currentGame;
  const isCurrentPlayer = currentPlayer.name === playerName;

  // タイマーの色を設定
  const getTimerColor = () => {
    if (timeRemaining <= 5) return "#ff4d4d"; // 残り5秒未満は赤
    if (timeRemaining <= 10) return "#ffcc00"; // 残り10秒未満は黄色
    return "#4CAF50"; // それ以外は緑
  };

  // プレイヤー情報を表示
  const renderPlayerInfo = () => {
    return players.map((player) => (
      <PlayerInfo
        key={player.name}
        active={currentPlayer.name === player.name && !isGameOver}
      >
        {player.name} ({player.color === "black" ? "黒" : "白"})
        {currentPlayer.name === player.name && !isGameOver
          ? " - あなたのターンです"
          : ""}
      </PlayerInfo>
    ));
  };

  return (
    <Container>
      <Card>
        <Title>五目並べ</Title>

        <SoundToggle>
          <input
            type="checkbox"
            id="soundToggle"
            checked={soundEnabled}
            onChange={toggleSound}
          />
          <label htmlFor="soundToggle">
            効果音 {soundEnabled ? "オン" : "オフ"}
          </label>
        </SoundToggle>

        <GameInfoContainer>
          {isGameOver ? (
            winner ? (
              <h3>{winner.name}の勝利です！</h3>
            ) : (
              <h3>引き分けです！</h3>
            )
          ) : (
            <h3>
              現在のターン: {currentPlayer.name} (
              {currentPlayer.color === "black" ? "黒" : "白"})
            </h3>
          )}

          {renderPlayerInfo()}

          {!isGameOver && currentTimerPlayer && (
            <TimerContainer color={getTimerColor()}>
              {currentTimerPlayer}の残り時間: {timeRemaining}秒
            </TimerContainer>
          )}
        </GameInfoContainer>

        {message && <Message>{message}</Message>}

        <BoardContainer>
          <GameBoard
            board={board}
            onCellClick={(row, col) => makeMove(row, col)}
            lastMove={currentGame.lastMove}
            isCurrentPlayer={isCurrentPlayer && !isGameOver}
          />
        </BoardContainer>

        <ButtonContainer>
          {isGameOver ? (
            <Button onClick={returnToLobby}>ロビーに戻る</Button>
          ) : (
            <>
              <Button onClick={forfeitGame}>降参する</Button>
              <Button onClick={returnToLobby}>
                ゲームを中断してロビーに戻る
              </Button>
            </>
          )}
        </ButtonContainer>
      </Card>
    </Container>
  );
}

export default GameRoom;
