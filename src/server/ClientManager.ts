import { IPacket } from "../packets/interfaces/IPacket";
import { ProTankiClient } from "./ProTankiClient";

export class ClientManager {
  private clients: ProTankiClient[] = [];

  addClient(client: ProTankiClient): void {
    this.clients.push(client);
  }

  removeClient(client: ProTankiClient): void {
    this.clients = this.clients.filter((c) => c !== client);
  }

  getClients(): ProTankiClient[] {
    return this.clients;
  }

  getClientCount(): number {
    return this.clients.length;
  }

  sendToLobbyClients(packet: IPacket): void {
    this.clients.forEach((client) => {
      if (client.getState() === "lobby") {
        client.sendPacket(packet);
      }
    });
  }
}