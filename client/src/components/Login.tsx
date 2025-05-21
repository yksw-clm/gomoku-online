import { useState } from "react";
import { useGame } from "../contexts/GameContext";
import {
  Container,
  Title,
  Input,
  Button,
  Card,
  Message,
} from "../styles/commonStyles";

function Login() {
  const { setPlayerName, message } = useGame();
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setPlayerName(name.trim());
    }
  };

  return (
    <Container>
      <Card>
        <Title>五目並べオンライン</Title>
        <form onSubmit={handleSubmit}>
          <label htmlFor="playerName">プレイヤー名を入力してください:</label>
          <Input
            id="playerName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="名前を入力"
            autoFocus
          />
          <Button type="submit" disabled={!name.trim()}>
            ゲームに参加
          </Button>
        </form>
        {message && <Message>{message}</Message>}
      </Card>
    </Container>
  );
}

export default Login;
