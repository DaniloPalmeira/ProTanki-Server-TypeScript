import * as net from "net";
import { GameServer } from "./game.server";
export interface IClientOptions {
    socket: net.Socket;
    server: GameServer;
}