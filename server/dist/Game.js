"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
class Game {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
        this.board = new chess_js_1.Chess();
        this.moves = [];
        this.startTime = new Date().getTime();
    }
    makeMove(socket, move) {
        if (this.board.turn() == "w" && socket !== this.p1)
            return;
        if (this.board.turn() == "b" && socket !== this.p2)
            return;
        try {
            this.board.move(move);
            console.log("move", this.board.ascii());
        }
        catch (error) {
            return;
        }
        if (this.board.isGameOver()) {
            this.p1.send(JSON.stringify({
                type: messages_1.GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white",
                },
            }));
        }
        else {
            this.p1.send(JSON.stringify({
                type: messages_1.MOVE,
                payload: move,
            }));
            this.p2.send(JSON.stringify({
                type: messages_1.MOVE,
                payload: move,
            }));
        }
    }
    rolldice(socket) {
        if (this.board.turn() == "w" && socket !== this.p1)
            return;
        if (this.board.turn() == "b" && socket !== this.p2)
            return;
        const legalMoves = this.board.moves({ verbose: true });
        const randomPieces = getRandomPiece(this.board.moves({ verbose: true }));
        console.log(randomPieces.filteredMoves);
        socket.send(JSON.stringify({
            type: "roll",
            filteredMoves: randomPieces.filteredMoves,
            piece: randomPieces.randomType,
        }));
    }
}
exports.Game = Game;
function getRandomPiece(legals) {
    const availableTypes = new Set();
    legals.forEach((move) => {
        if (move.san.startsWith("Q"))
            availableTypes.add("Q");
        else if (move.san.startsWith("N"))
            availableTypes.add("N");
        else if (move.san.startsWith("K"))
            availableTypes.add("K");
        else if (move.san.startsWith("B"))
            availableTypes.add("B");
        else if (move.san.startsWith("R"))
            availableTypes.add("R");
        else
            availableTypes.add("P");
    });
    const typesArray = Array.from(availableTypes);
    const randomType = typesArray[Math.floor(Math.random() * typesArray.length)];
    const filteredMoves = legals.filter((move) => {
        if (randomType === "P")
            return !/[A-Z]/.test(move.san[0]);
        return move.san.startsWith(randomType);
    });
    const data = {
        randomType,
        filteredMoves,
    };
    return data;
}
