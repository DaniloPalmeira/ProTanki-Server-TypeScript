import { IPacket } from "@/packets/packet.interfaces";
import { ClientState } from "./client.state";
import { GameClient } from "./game.client";

export class ClientManager {
  private clients: GameClient[] = [];

  public addClient(client: GameClient): void {
    this.clients.push(client);
  }

  public removeClient(client: GameClient): void {
    this.clients = this.clients.filter((c) => c !== client);
  }

  public getClients(): GameClient[] {
    return this.clients;
  }

  public getClientCount(): number {
    return this.clients.length;
  }

  public findClientByIp(ip: string): GameClient | undefined {
    return this.clients.find((c) => c.getRemoteAddress() === ip);
  }

  public findClientByUsername(username: string): GameClient | undefined {
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