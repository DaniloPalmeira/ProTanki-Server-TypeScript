import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { LobbyWorkflow } from "../../workflows/LobbyWorkflow";
import { ILoadFriends } from "../interfaces/ILoadFriends";
import { BasePacket } from "./BasePacket";

export default class LoadFriends extends BasePacket implements ILoadFriends {
  unknown: boolean = false;

  read(buffer: Buffer): void {
    this.unknown = buffer.readInt8(0) === 1;
  }

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  async run(server: ProTankiServer, client: ProTankiClient): Promise<void> {
    await LobbyWorkflow.sendFriendsList(client, server);
  }

  toString(): string {
    return `LoadFriends(unknown=${this.unknown})`;
  }

  getId(): number {
    return -731115522;
  }
}
