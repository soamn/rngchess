import { Chess, Square } from "chess.js";
import { useEffect, useState } from "react";
import Dice from "./dice";
type Color = "w" | "b";
const Board = () => {
  const [chess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [from, setFrom] = useState<string | null>(null);
  const [turn, setTurn] = useState<Color>("w");
  const [id, setId] = useState();
  const [ws, setWs] = useState<WebSocket>();
  const [legalMoves, setLegalMoves] = useState<Array<string>>();
  const [highlightedSquares] = useState<Array<string>>();
  const [highlightedPieces] = useState<Array<string>>();
  const [color, setColor] = useState<Color>("w");
  const [loading, setLoading] = useState(true);
  const [rolledPiece, setRolledPiece] = useState("q");
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);

  if (ws)
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "game",
        })
      );
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "game") {
          setLoading(false);
          setId(data.id);
          setColor(data.color);
          setIsRolling(data.color === turn);
        }
        if (data.type === "move") {
          chess.move(data.payload);
          setBoard(chess.board());
          setTurn(chess.turn() as Color);
          setIsRolling(chess.turn() === color);
          setFrom(null);
          setHasRolled(false);
        }

        if (data.type === "roll") {
          setLegalMoves(data.filteredMoves);
          setRolledPiece(data.piece);
          setHasRolled(true);
        }
        console.log("Received from server:", data);
      };
    };

  const pieceSymbols: Record<string, string> = {
    r: "♜",
    n: "♞",
    b: "♝",
    q: "♛",
    k: "♚",
    p: "♟",
    R: "♖",
    N: "♘",
    B: "♗",
    Q: "♕",
    K: "♔",
    P: "♙",
  };

  const makeMove = (square: Square) => {
    if (ws) {
      ws.send(
        JSON.stringify({
          type: "move",
          startTime: id,
          move: {
            from,
            to: square,
          },
        })
      );
    }
  };

  const handleSquareClick = (square: Square) => {
    const piece = chess.get(square);
    if (from) {
      if (piece && piece.color === turn) {
        setFrom(null);
        return;
      } else {
        makeMove(square);
        if (chess.move(square)) {
          setLegalMoves([]);
          const hp = document.querySelectorAll(".piece-highlight");
          hp.forEach((element) => element.classList.remove("piece-highlight"));
          const hs = document.querySelectorAll(".move-highlight");
          hs.forEach((element) => element.classList.remove("move-highlight"));
        }
      }
    } else {
      if (piece && piece.color === turn) {
        setFrom(square);
      }
    }
  };

  const handleDragStart = (square: Square) => {
    setFrom(square);
  };

  const handleDrop = (square: Square) => {
    try {
      if (from && from !== square) {
        makeMove(square);
      }
      setFrom(null);
    } catch (error) {
      return;
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRoll = () => {
    if (isRolling && !hasRolled && turn === color) {
      ws?.send(
        JSON.stringify({
          type: "roll",
          startTime: id,
        })
      );
    }
  };
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:1337");
    setWs(socket);
  }, []);
  useEffect(() => {
    if (!legalMoves) return;
    if (legalMoves?.length > 0) {
      legalMoves.forEach((move: any) => {
        highlightedPieces?.push(move.from);
        highlightedSquares?.push(move.to);
        const pieceSquare = document.getElementById(move.from);
        pieceSquare?.classList.add("piece-highlight");
        const moveSquare = document.getElementById(move.to);
        moveSquare?.classList.add("move-highlight");
      });
    }
  }, [legalMoves]);

  const renderBoard = () => {
    const displayBoard = color === "b" ? [...board].reverse() : board;
    return displayBoard.map((row, rowIndex) =>
      (color === "b" ? [...row].reverse() : row).map((cell, colIndex) => {
        const file = String.fromCharCode(
          97 + (color === "b" ? 7 - colIndex : colIndex)
        );
        const rank = color === "b" ? 1 + rowIndex : 8 - rowIndex;
        const squareNotation = `${file}${rank}` as Square;
        const isWhiteSquare = (rowIndex + colIndex) % 2 === 0;
        const pieceSymbol = cell
          ? pieceSymbols[
              cell.color === "w" ? cell.type.toUpperCase() : cell.type
            ]
          : null;
        const isSelected = from === squareNotation;
        return (
          <div
            onClick={() => handleSquareClick(squareNotation)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(squareNotation)}
            key={`${rowIndex}-${colIndex}`}
            id={`${squareNotation}`}
            className={`flex items-center justify-center text-2xl ${
              isWhiteSquare ? "bg-[#f0d9b5]" : "bg-[#b58863]"
            }`}
          >
            {pieceSymbol && (
              <div
                draggable
                onDragStart={() => handleDragStart(squareNotation)}
                className={`w-full h-full grid justify-center items-center ${
                  isSelected ? "bg-yellow-200" : "bg-inherit"
                }`}
              >
                {pieceSymbol}
              </div>
            )}
          </div>
        );
      })
    );
  };
  if (loading) {
    return <div>Loading</div>;
  }
  return (
    <>
      <div className="h-[600px] bg-red-50 grid justify-center">
        <div className="grid grid-cols-8 grid-rows-8 w-[600px] h-[600px] border-2 border-black">
          {renderBoard()}
        </div>
        {isRolling ? (
          <button onClick={handleRoll}>
            <Dice piece={rolledPiece} />
          </button>
        ) : (
          <button onClick={handleRoll} disabled>
            <Dice piece={rolledPiece} />
          </button>
        )}
      </div>
    </>
  );
};

export default Board;
