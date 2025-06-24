import { BufferReader } from "../../utils/buffer/BufferReader";
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
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `SendChatMessage(to: ${this.targetNickname}, message: ${this.message})`;
  }

  static getId(): number {
    return 705454610;
  }
}
