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

  private getOptionalStringSize(value: string | null): number {
    if (!value) return 1;
    return 1 + 4 + Buffer.byteLength(value, "utf8");
  }

  private getUserSize(user: IChatMessageUser | null): number {
    if (!user) return 1;
    return 1 + 4 + this.getOptionalStringSize(user.ip) + 4 + this.getOptionalStringSize(user.uid);
  }

  private writeOptionalStringToBuffer(buffer: Buffer, offset: number, value: string | null): number {
    const isEmpty = !value;
    offset = buffer.writeUInt8(isEmpty ? 1 : 0, offset);
    if (!isEmpty) {
      const valueBuffer = Buffer.from(value!, "utf8");
      offset = buffer.writeInt32BE(valueBuffer.length, offset);
      valueBuffer.copy(buffer, offset);
      offset += valueBuffer.length;
    }
    return offset;
  }

  private writeUserToBuffer(buffer: Buffer, offset: number, user: IChatMessageUser | null): number {
    const isEmpty = !user;
    offset = buffer.writeUInt8(isEmpty ? 1 : 0, offset);
    if (!isEmpty) {
      offset = buffer.writeInt32BE(user!.moderatorLevel, offset);
      offset = this.writeOptionalStringToBuffer(buffer, offset, user!.ip);
      offset = buffer.writeInt32BE(user!.rank, offset);
      offset = this.writeOptionalStringToBuffer(buffer, offset, user!.uid);
    }
    return offset;
  }

  write(): Buffer {
    let totalSize = 4;
    for (const msg of this.messages) {
      totalSize += this.getUserSize(msg.source);
      totalSize += 1;
      totalSize += this.getUserSize(msg.target);
      totalSize += this.getOptionalStringSize(msg.message);
      totalSize += 1;
    }

    const packet = Buffer.alloc(totalSize);
    let offset = 0;

    offset = packet.writeInt32BE(this.messages.length, offset);

    for (const msg of this.messages) {
      offset = this.writeUserToBuffer(packet, offset, msg.source);
      offset = packet.writeUInt8(msg.isSystem ? 1 : 0, offset);
      offset = this.writeUserToBuffer(packet, offset, msg.target);
      offset = this.writeOptionalStringToBuffer(packet, offset, msg.message);
      offset = packet.writeUInt8(msg.isWarning ? 1 : 0, offset);
    }

    return packet;
  }

  toString(): string {
    return `ChatHistory(messages=${this.messages.length})`;
  }

  static getId(): number {
    return -1263520410;
  }
}
