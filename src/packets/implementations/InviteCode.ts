import { IInviteCode } from "../interfaces/IInviteCode";
import { BasePacket } from "./BasePacket";

export default class InviteCode extends BasePacket implements IInviteCode {
  inviteCode: string;

  constructor(inviteCode: string = "") {
    super();
    this.inviteCode = inviteCode;
  }

  read(buffer: Buffer): void {
    const isEmpty = buffer.readInt8(0) === 1;
    if (isEmpty) {
      this.inviteCode = "";
      return;
    }
    const length = buffer.readInt32BE(1);
    this.inviteCode = buffer.toString("utf8", 5, 5 + length);
  }

  write(): Buffer {
    if (this.inviteCode.length == 0) {
      return Buffer.from([1]);
    }
    const stringBuffer = Buffer.from(this.inviteCode, "utf8");
    const packetSize = 5 + stringBuffer.length;
    const buffer = Buffer.alloc(packetSize);
    buffer.writeInt8(0, 0);
    buffer.writeInt32BE(stringBuffer.length, 1);
    stringBuffer.copy(buffer, 5);
    return buffer;
  }

  toString(): string {
    return `InviteCode(inviteCode=${this.inviteCode})`;
  }

  static getId(): number {
    return 509394385;
  }
}
