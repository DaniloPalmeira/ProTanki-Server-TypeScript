import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IInviteEnabled } from "../interfaces/IInviteEnabled";
import { BasePacket } from "./BasePacket";

export default class InviteEnabled extends BasePacket implements IInviteEnabled {
  requireInviteCode: boolean = false;

  constructor(requireInviteCode?: boolean) {
    super();
    if (requireInviteCode !== undefined) {
      this.requireInviteCode = requireInviteCode;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.requireInviteCode = reader.readUInt8() === 1;
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeUInt8(this.requireInviteCode ? 1 : 0);
    return writer.getBuffer();
  }

  toString(): string {
    return `InviteEnabled(requireInviteCode=${this.requireInviteCode})`;
  }

  static getId(): number {
    return 444933603;
  }
}
