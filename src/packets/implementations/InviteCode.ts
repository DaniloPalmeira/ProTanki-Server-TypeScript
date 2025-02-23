import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IInviteCode } from "../interfaces/IInviteCode";

export default class InviteCode implements IInviteCode {
  inviteCode: string;

  constructor(inviteCode: string) {
    this.inviteCode = inviteCode;
  }

  read(buffer: Buffer): void {
    const isEmpty = buffer.readInt8(0) === 1;
    this.inviteCode = "";
    if (!isEmpty) {
      const length = buffer.readInt32BE(1);
      this.inviteCode = buffer.toString("utf8", 5, 5 + length);
    }
  }

  write(): Buffer {
    const isEmpty = this.inviteCode.length === 0;
    const packet = Buffer.alloc(isEmpty ? 1 : 1 + 4 + this.inviteCode.length);
    packet.writeInt8(isEmpty ? 1 : 0, 0);
    if (!isEmpty) {
      packet.writeInt32BE(this.inviteCode.length, 1);
      packet.write(this.inviteCode, 5);
    }
    return packet;
  }

  run(server: ProTankiServer, client: ProTankiClient): void {
    client.inviteCodeTyped = this.inviteCode;
  }

  toString(): string {
    return `InviteCode(inviteCode: ${this.inviteCode})`;
  }

  getId(): number {
    return 509394385;
  }
}
