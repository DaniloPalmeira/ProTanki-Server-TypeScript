import net from "net";
import { ClientManager } from "./ClientManager";
import { ProTankiClient } from "./ProTankiClient";
import { IPacket } from "../packets/interfaces/IPacket";
import { IServerOptions } from "../types/IServerOptions";

export class ProTankiServer {
  private server: net.Server;
  private clientManager: ClientManager;
  private port: number;
  private maxClients: number;
  private needInviteCode: boolean = false;

  constructor({
    port = 5555,
    maxClients = 100,
    needInviteCode = false,
  }: IServerOptions) {
    this.port = port;
    this.maxClients = maxClients;
    this.needInviteCode = needInviteCode;
    this.server = net.createServer(this.handleConnection.bind(this));
    this.clientManager = new ClientManager();
    this.maxClients = maxClients;
  }

  start(): void {
    this.server.listen(this.port, () => {
      console.log(`ProTanki Server started on port ${this.port}`);
      console.log(`Max clients allowed: ${this.maxClients}`);
    });

    this.server.on("error", (err) => {
      console.error("Server error:", err);
    });
  }

  addClient(client: ProTankiClient): void {
    this.clientManager.addClient(client);
  }

  removeClient(client: ProTankiClient): void {
    this.clientManager.removeClient(client);
  }

  private handleConnection(socket: net.Socket): void {
    if (this.clientManager.getClientCount() >= this.maxClients) {
      console.log(
        `Connection rejected: server at max capacity (${this.maxClients})`
      );
      socket.write("Server is full. Try again later.\n");
      socket.end();
      return;
    }

    console.log("New client connected:", socket.remoteAddress);

    const client = new ProTankiClient({ socket, server: this });
    this.clientManager.addClient(client);
  }

  getNeedInviteCode(): boolean {
    return this.needInviteCode;
  }

  broadcastToLobby(packet: IPacket): void {
    this.clientManager.sendToLobbyClients(packet);
  }
}
