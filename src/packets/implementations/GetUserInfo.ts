import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { LobbyWorkflow } from "../../workflows/LobbyWorkflow";
import { IGetUserInfo } from "../interfaces/IGetUserInfo";
import { BasePacket } from "./BasePacket";

export default class GetUserInfo extends BasePacket implements IGetUserInfo {
  nickname: string = "";

  read(buffer: Buffer): void {
    const isEmpty = buffer.readInt8(0) === 1;
    if (!isEmpty) {
      const length = buffer.readInt32BE(1);
      this.nickname = buffer.toString("utf8", 5, 5 + length);
    }
  }

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  async run(server: ProTankiServer, client: ProTankiClient): Promise<void> {
    if (this.nickname) {
      await LobbyWorkflow.sendFullUserInfo(client, server, this.nickname);
    }
  }

  toString(): string {
    return `GetUserInfo(nickname=${this.nickname})`;
  }

  static getId(): number {
    return 1774907609;
  }
}
