import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { ISendChatMessage } from "../interfaces/ISendChatMessage";

export default class SendChatMessage extends BasePacket implements ISendChatMessage {
  targetNickname: string | null = null;
  message: string | null;

  constructor(targetNickname: string | null, message: string | null) {
    super();
    this.targetNickname = targetNickname;
    this.message = message;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.targetNickname = reader.readOptionalString();
    this.message = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.targetNickname);
    writer.writeOptionalString(this.message);
    return writer.getBuffer();
  }

  toString(): string {
    return `SendChatMessage(to: ${this.targetNickname}, message: ${this.message})`;
  }

  static getId(): number {
    return 705454610;
  }
}
