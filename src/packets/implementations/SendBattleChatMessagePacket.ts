import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { ISendBattleChatMessage } from "../interfaces/ISendBattleChatMessage";

export default class SendBattleChatMessagePacket extends BasePacket implements ISendBattleChatMessage {
  message: string | null;
  team: boolean;

  constructor(message: string | null = null, team: boolean = false) {
    super();
    this.message = message;
    this.team = team;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.message = reader.readOptionalString();
    this.team = reader.readUInt8() === 1;
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.message);
    writer.writeUInt8(this.team ? 1 : 0);
    return writer.getBuffer();
  }

  toString(): string {
    return `SendBattleChatMessagePacket(message=${this.message}, team=${this.team})`;
  }

  static getId(): number {
    return 945463181;
  }
}
