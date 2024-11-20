import WebSocket = require("ws");
import { INIT_GAME, MOVE } from "./messages";
import { Game } from "./Game";

export class GameManager {
  private games: Game[];
  private pendingUser!: WebSocket | null;
  private users: WebSocket[] = [];

  constructor() {
    this.games = [];
  }
  addUser(socket: WebSocket) {
    this.users.push(socket);
    this.addHandler(socket);
  }
  removeUser(socket: WebSocket) {}

  private addHandler(socket: WebSocket) {
    socket.on("message", (data) => {
      const messsage = JSON.parse(data.toString());
      console.log(messsage);

      if (messsage.type === INIT_GAME) {
        if (this.pendingUser) {
          const game = new Game(this.pendingUser, socket);
          this.games.push(game);
          this.pendingUser.send(
            JSON.stringify({
              type: INIT_GAME,
              id: game.startTime,
              color: "w",
            })
          );
          this.pendingUser = null;
          socket.send(
            JSON.stringify({
              type: INIT_GAME,
              id: game.startTime,
              color: "b",
            })
          );
        } else {
          this.pendingUser = socket;
        }
      }
      if (messsage.type == MOVE) {
        const game = this.games.find(
          (game) => game.startTime === messsage.startTime
        );

        game?.makeMove(socket, messsage.move);
      }
      if (messsage.type == "roll") {
        const game = this.games.find(
          (game) => game.startTime === messsage.startTime
        );
        game?.rolldice(socket);
      }
    });
  }
}
