import styled from "styled-components";

export const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

export const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 20px;
`;

export const Button = styled.button`
  background-color: #4caf50;
  border: none;
  color: white;
  padding: 10px 15px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: #45a049;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
`;

export const Card = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 20px;
  margin: 10px 0;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const Message = styled.div`
  padding: 10px;
  background-color: #f8f8f8;
  border: 1px solid #eee;
  border-radius: 4px;
  margin: 10px 0;
  color: #333;
  text-align: center;
`;

export const GameInfoContainer = styled.div`
  margin-top: 15px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

export const BoardContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
`;

export const PlayerInfo = styled.p<{ active?: boolean }>`
  margin: 5px 0;
  font-weight: ${(props) => (props.active ? "bold" : "normal")};
  color: ${(props) => (props.active ? "#4CAF50" : "#333")};
`;
