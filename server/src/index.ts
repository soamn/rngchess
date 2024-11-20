import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
const wss = new WebSocketServer({ port: 1337 });
const gameManager = new GameManager();
wss.on("connection", function connection(ws) {
  ws.on("error", console.error);
  gameManager.addUser(ws);
  ws.send(JSON.stringify("connected"));
  ws.on("disconnect", () => {
    gameManager.removeUser(ws);
    console.log("disconnected");
  });
});
