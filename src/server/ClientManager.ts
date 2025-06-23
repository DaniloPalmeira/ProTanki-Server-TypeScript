import { IPacket } from "../packets/interfaces/IPacket";
import { ProTankiClient } from "./ProTankiClient";

export class ClientManager {
  private clients: ProTankiClient[] = [];

  public addClient(client: ProTankiClient): void {
    this.clients.push(client);
  }

  public removeClient(client: ProTankiClient): void {
    this.clients = this.clients.filter((c) => c !== client);
  }

  public getClients(): ProTankiClient[] {
    return this.clients;
  }

  public getClientCount(): number {
    return this.clients.length;
  }

  public findClientByIp(ip: string): ProTankiClient | undefined {
    return this.clients.find((c) => c.getRemoteAddress() === ip);
  }

  public sendToLobbyClients(packet: IPacket): void {
    this.clients.forEach((client) => {
      if (client.getState() === "lobby") {
        client.sendPacket(packet);
      }
    });
  }
}
