import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IChatHistory, IChatMessageData, IChatMessageUser } from "../interfaces/IChatHistory";
import { BasePacket } from "./BasePacket";

export default class ChatHistory extends BasePacket implements IChatHistory {
  messages: IChatMessageData[] = [];

  constructor(messages?: IChatMessageData[]) {
    super();
    if (messages) {
      this.messages = messages;
    }
  }

  private readUserFromBuffer(reader: BufferReader): IChatMessageUser | null {
    const isEmpty = reader.readUInt8() === 1;
    if (isEmpty) {
      return null;
    }
    return {
      moderatorLevel: reader.readInt32BE(),
      ip: reader.readOptionalString(),
      rank: reader.readInt32BE(),
      uid: reader.readOptionalString() ?? "",
    };
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    const count = reader.readInt32BE();
    this.messages = [];
    for (let i = 0; i < count; i++) {
      this.messages.push({
        source: this.readUserFromBuffer(reader),
        isSystem: reader.readUInt8() === 1,
        target: this.readUserFromBuffer(reader),
        message: reader.readOptionalString() ?? "",
        isWarning: reader.readUInt8() === 1,
      });
    }
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
    const messageSummaries = this.messages.map((m) => `{${m.source?.uid ?? "SYS"}->${m.target?.uid ?? "ALL"}: "${m.message}"}`).join(", ");
    return `ChatHistory(count=${this.messages.length}, messages=[${messageSummaries}])`;
  }

  static getId(): number {
    return -1263520410;
  }
}
