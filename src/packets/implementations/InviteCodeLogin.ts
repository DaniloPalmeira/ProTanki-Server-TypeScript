import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IInviteCodeLogin } from "../interfaces/IInviteCodeLogin";
import { BasePacket } from "./BasePacket";

export default class InviteCodeLogin
  extends BasePacket
  implements IInviteCodeLogin
{
  nickname?: string;

  constructor(nickname?: string) {
    super();
    this.nickname = nickname;
  }

  read(buffer: Buffer): void {
    const isEmpty = buffer.readInt8(0) === 1;
    this.nickname = undefined;
    if (!isEmpty) {
      const length = buffer.readInt32BE(1);
      this.nickname = buffer.toString("utf8", 5, 5 + length);
    }
  }

  write(): Buffer {
    const isEmpty = !this.nickname || this.nickname.length === 0;
    const nicknameLength = this.nickname?.length || 0;
    const packet = Buffer.alloc(isEmpty ? 1 : 5 + nicknameLength);
    packet.writeInt8(isEmpty ? 1 : 0, 0);
    if (!isEmpty) {
      packet.writeInt32BE(nicknameLength, 1);
      packet.write(this.nickname!, 5);
    }
    return packet;
  }

  toString(): string {
    return `InviteCodeLogin(nickname=${this.nickname})`;
  }

  getId(): number {
    return 714838911;
  }
}
