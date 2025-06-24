import { BasePacket } from "./BasePacket";
import { ISendChatMessage } from "../interfaces/ISendChatMessage";

export default class SendChatMessage extends BasePacket implements ISendChatMessage {
  targetNickname: string | null = null;
  message: string = "";

  read(buffer: Buffer): void {
    let offset = 0;

    let isEmpty = buffer.readInt8(offset) === 1;
    offset += 1;
    if (!isEmpty) {
      const nickLength = buffer.readInt32BE(offset);
      offset += 4;
      this.targetNickname = buffer.toString("utf-8", offset, offset + nickLength);
      offset += nickLength;
    }

    isEmpty = buffer.readInt8(offset) === 1;
    offset += 1;
    if (!isEmpty) {
      const messageLength = buffer.readInt32BE(offset);
      offset += 4;
      this.message = buffer.toString("utf-8", offset, offset + messageLength);
    }
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
