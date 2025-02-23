import * as net from "net";
import { ProTankiServer } from "../server/ProTankiServer";
export interface IClientOptions {
  socket: net.Socket;
  server: ProTankiServer;
}
