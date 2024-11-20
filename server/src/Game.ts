import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, MOVE } from "./messages";
export class Game {
  public p1: WebSocket;
  public p2: WebSocket;
  private moves: string[];
  public startTime: number;
  private board: Chess;
  constructor(p1: WebSocket, p2: WebSocket) {
    this.p1 = p1;
    this.p2 = p2;
    this.board = new Chess();
    this.moves = [];
    this.startTime = new Date().getTime();
  }
  makeMove(
    socket: WebSocket,
    move: {
      from: string;
      to: string;
    }
  ) {
    if (this.board.turn() == "w" && socket !== this.p1) return;
    if (this.board.turn() == "b" && socket !== this.p2) return;

    try {
      this.board.move(move);
      console.log("move", this.board.ascii());
    } catch (error) {
      return;
    }

    if (this.board.isGameOver()) {
      this.p1.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );
    } else {
      this.p1.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
      this.p2.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    }
  }
  rolldice(socket: WebSocket) {
    if (this.board.turn() == "w" && socket !== this.p1) return;
    if (this.board.turn() == "b" && socket !== this.p2) return;
    const legalMoves = this.board.moves({ verbose: true });
    const randomPieces = getRandomPiece(this.board.moves({ verbose: true }));

    console.log(randomPieces.filteredMoves);
    socket.send(
      JSON.stringify({
        type: "roll",
        filteredMoves: randomPieces.filteredMoves,
        piece: randomPieces.randomType,
      })
    );
  }
}

function getRandomPiece(legals: any) {
  const availableTypes = new Set();
  legals.forEach((move: any) => {
    if (move.san.startsWith("Q")) availableTypes.add("Q");
    else if (move.san.startsWith("N")) availableTypes.add("N");
    else if (move.san.startsWith("K")) availableTypes.add("K");
    else if (move.san.startsWith("B")) availableTypes.add("B");
    else if (move.san.startsWith("R")) availableTypes.add("R");
    else availableTypes.add("P");
  });
  const typesArray = Array.from(availableTypes);
  const randomType = typesArray[Math.floor(Math.random() * typesArray.length)];

  const filteredMoves = legals.filter((move: any) => {
    if (randomType === "P") return !/[A-Z]/.test(move.san[0]);
    return move.san.startsWith(randomType as string);
  });
  const data = {
    randomType,
    filteredMoves,
  };
  return data;
}
