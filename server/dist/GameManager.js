"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const messages_1 = require("./messages");
const Game_1 = require("./Game");
class GameManager {
    constructor() {
        this.users = [];
        this.games = [];
    }
    addUser(socket) {
        this.users.push(socket);
        this.addHandler(socket);
    }
    removeUser(socket) { }
    addHandler(socket) {
        socket.on("message", (data) => {
            const messsage = JSON.parse(data.toString());
            console.log(messsage);
            if (messsage.type === messages_1.INIT_GAME) {
                if (this.pendingUser) {
                    const game = new Game_1.Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser.send(JSON.stringify({
                        type: messages_1.INIT_GAME,
                        id: game.startTime,
                        color: "w",
                    }));
                    this.pendingUser = null;
                    socket.send(JSON.stringify({
                        type: messages_1.INIT_GAME,
                        id: game.startTime,
                        color: "b",
                    }));
                }
                else {
                    this.pendingUser = socket;
                }
            }
            if (messsage.type == messages_1.MOVE) {
                const game = this.games.find((game) => game.startTime === messsage.startTime);
                game === null || game === void 0 ? void 0 : game.makeMove(socket, messsage.move);
            }
            if (messsage.type == "roll") {
                const game = this.games.find((game) => game.startTime === messsage.startTime);
                game === null || game === void 0 ? void 0 : game.rolldice(socket);
            }
        });
    }
}
exports.GameManager = GameManager;
