import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { ICheckNicknameAvailable } from "../interfaces/ICheckNicknameAvailable";
import NicknameAvailable from "./NicknameAvailable";

export default class CheckNicknameAvailable implements ICheckNicknameAvailable {
  nickname: string;

  constructor(nickname: string) {
    this.nickname = nickname;
  }

  read(buffer: Buffer): void {
    const isEmpty = buffer.readInt8(0) === 1;
    this.nickname = "";
    if (!isEmpty) {
      const length = buffer.readInt32BE(1);
      this.nickname = buffer.toString("utf8", 5, 5 + length);
    }
  }

  write(): Buffer {
    const isEmpty = this.nickname.length === 0;
    const packet = Buffer.alloc(isEmpty ? 1 : 5 + this.nickname.length);
    packet.writeInt8(isEmpty ? 1 : 0, 0);
    if (!isEmpty) {
      packet.writeInt32BE(this.nickname.length, 1);
      packet.write(this.nickname, 5);
    }
    return packet;
  }

  async run(server: ProTankiServer, client: ProTankiClient): Promise<void> {
    if (this.nickname == "available") {
      client.sendPacket(new NicknameAvailable());
    }
  }

  toString(): string {
    return `CheckNicknameAvailable(nickname: ${this.nickname})`;
  }

  getId(): number {
    return 1083705823;
  }
}
