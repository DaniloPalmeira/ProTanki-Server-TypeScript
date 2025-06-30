import { IPacket } from "../packets/interfaces/IPacket";
import { ClientState } from "../types/ClientState";
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

  public findClientByUsername(username: string): ProTankiClient | undefined {
    const lowerCaseUsername = username.toLowerCase();
    return this.clients.find((c) => c.user?.username.toLowerCase() === lowerCaseUsername);
  }

  public sendToLobbyChatListeners(packet: IPacket): void {
    const lobbyChatStates: ClientState[] = ["chat_lobby", "chat_garage"];
    this.clients.forEach((client) => {
      if (lobbyChatStates.includes(client.getState())) {
        client.sendPacket(packet);
      }
    });
  }

  public sendToBattleListWatchers(packet: IPacket): void {
    const battleListStates: ClientState[] = ["chat_lobby", "battle_lobby"];
    this.clients.forEach((client) => {
      if (battleListStates.includes(client.getState())) {
        client.sendPacket(packet);
      }
    });
  }
}
