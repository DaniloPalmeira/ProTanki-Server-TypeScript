import { IChatProperties, IChatPropertiesProps } from "../interfaces/IChatProperties";
import { BasePacket } from "./BasePacket";

export default class ChatProperties extends BasePacket implements IChatProperties {
  admin: boolean;
  antifloodEnabled: boolean;
  bufferSize: number;
  chatEnabled: boolean;
  chatModeratorLevel: number;
  linksWhiteList: string[];
  minChar: number;
  minWord: number;
  selfName: string;
  showLinks: boolean;
  typingSpeedAntifloodEnabled: boolean;

  constructor(data: IChatPropertiesProps) {
    super();
    this.admin = data.admin;
    this.antifloodEnabled = data.antifloodEnabled;
    this.bufferSize = data.bufferSize;
    this.chatEnabled = data.chatEnabled;
    this.chatModeratorLevel = data.chatModeratorLevel;
    this.linksWhiteList = data.linksWhiteList;
    this.minChar = data.minChar;
    this.minWord = data.minWord;
    this.selfName = data.selfName;
    this.showLinks = data.showLinks;
    this.typingSpeedAntifloodEnabled = data.typingSpeedAntifloodEnabled;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  private getStringArraySize(array: string[]): number {
    if (array.length === 0) return 1;
    let size = 1 + 4;
    for (const item of array) {
      size += 1 + 4 + Buffer.byteLength(item, "utf8");
    }
    return size;
  }

  private writeStringArrayToBuffer(buffer: Buffer, offset: number, array: string[]): number {
    const isEmpty = array.length === 0;
    offset = buffer.writeUInt8(isEmpty ? 1 : 0, offset);
    if (!isEmpty) {
      offset = buffer.writeInt32BE(array.length, offset);
      for (const item of array) {
        offset = buffer.writeUInt8(0, offset);
        const itemBuff = Buffer.from(item, "utf8");
        offset = buffer.writeInt32BE(itemBuff.length, offset);
        itemBuff.copy(buffer, offset);
        offset += itemBuff.length;
      }
    }
    return offset;
  }

  private getOptionalStringSize(value: string): number {
    if (!value) return 1;
    return 1 + 4 + Buffer.byteLength(value, "utf8");
  }

  private writeOptionalStringToBuffer(buffer: Buffer, offset: number, value: string): number {
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

  write(): Buffer {
    const fixedSize = 1 + 1 + 4 + 1 + 4 + 4 + 4 + 1 + 1;
    const linksSize = this.getStringArraySize(this.linksWhiteList);
    const nameSize = this.getOptionalStringSize(this.selfName);
    const totalSize = fixedSize + linksSize + nameSize;

    const packet = Buffer.alloc(totalSize);
    let offset = 0;

    offset = packet.writeUInt8(this.admin ? 1 : 0, offset);
    offset = packet.writeUInt8(this.antifloodEnabled ? 1 : 0, offset);
    offset = packet.writeInt32BE(this.bufferSize, offset);
    offset = packet.writeUInt8(this.chatEnabled ? 1 : 0, offset);
    offset = packet.writeInt32BE(this.chatModeratorLevel, offset);
    offset = this.writeStringArrayToBuffer(packet, offset, this.linksWhiteList);
    offset = packet.writeInt32BE(this.minChar, offset);
    offset = packet.writeInt32BE(this.minWord, offset);
    offset = this.writeOptionalStringToBuffer(packet, offset, this.selfName);
    offset = packet.writeUInt8(this.showLinks ? 1 : 0, offset);
    offset = packet.writeUInt8(this.typingSpeedAntifloodEnabled ? 1 : 0, offset);

    return packet;
  }

  toString(): string {
    return `ChatProperties(user: ${this.selfName}, modLevel: ${this.chatModeratorLevel})`;
  }

  static getId(): number {
    return 178154988;
  }
}
