import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IChatHistory, IChatMessageData, IChatMessageUser } from "../interfaces/IChatHistory";
import { BasePacket } from "./BasePacket";

export default class ChatHistory extends BasePacket implements IChatHistory {
  messages: IChatMessageData[];

  constructor(messages: IChatMessageData[]) {
    super();
    this.messages = messages;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  private writeUserToBuffer(writer: BufferWriter, user: IChatMessageUser | null): void {
    const isEmpty = !user;
    writer.writeUInt8(isEmpty ? 1 : 0);
    if (!isEmpty) {
      writer.writeInt32BE(user!.moderatorLevel);
      writer.writeOptionalString(user!.ip);
      writer.writeInt32BE(user!.rank);
      writer.writeOptionalString(user!.uid);
    }
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.messages.length);

    for (const msg of this.messages) {
      this.writeUserToBuffer(writer, msg.source);
      writer.writeUInt8(msg.isSystem ? 1 : 0);
      this.writeUserToBuffer(writer, msg.target);
      writer.writeOptionalString(msg.message);
      writer.writeUInt8(msg.isWarning ? 1 : 0);
    }

    return writer.getBuffer();
  }

  toString(): string {
    return `ChatHistory(messages=${this.messages.length})`;
  }

  static getId(): number {
    return -1263520410;
  }
}
