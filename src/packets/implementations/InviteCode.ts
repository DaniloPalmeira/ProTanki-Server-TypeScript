import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IInviteCode } from "../interfaces/IInviteCode";
import { BasePacket } from "./BasePacket";

export default class InviteCode extends BasePacket implements IInviteCode {
  inviteCode: string | null;

  constructor(inviteCode: string | null = null) {
    super();
    this.inviteCode = inviteCode;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.inviteCode = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.inviteCode);
    return writer.getBuffer();
  }

  toString(): string {
    return `InviteCode(inviteCode=${this.inviteCode})`;
  }

  static getId(): number {
    return 509394385;
  }
}
