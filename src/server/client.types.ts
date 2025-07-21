import * as net from "net";
import { ProTankiServer } from "./ProTankiServer";
export interface IClientOptions {
    socket: net.Socket;
    server: ProTankiServer;
}