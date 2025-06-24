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

  private writeStringArray(array: string[]): Buffer {
    let bufferParts: Buffer[] = [];

    const isEmpty = array.length === 0;
    bufferParts.push(Buffer.from([isEmpty ? 1 : 0]));

    if (!isEmpty) {
      const countBuffer = Buffer.alloc(4);
      countBuffer.writeInt32BE(array.length);
      bufferParts.push(countBuffer);

      for (const item of array) {
        const itemBuff = Buffer.from(item, "utf8");
        const itemHeader = Buffer.alloc(5);
        itemHeader.writeInt8(0, 0); // not empty
        itemHeader.writeInt32BE(itemBuff.length, 1);
        bufferParts.push(itemHeader, itemBuff);
      }
    }

    return Buffer.concat(bufferParts);
  }

  write(): Buffer {
    const linksBuffer = this.writeStringArray(this.linksWhiteList);
    const nameBuffer = Buffer.from(this.selfName, "utf8");
    const nameHeader = Buffer.alloc(5);
    nameHeader.writeInt8(this.selfName.length === 0 ? 1 : 0, 0);
    if (this.selfName.length > 0) {
      nameHeader.writeInt32BE(nameBuffer.length, 1);
    }

    const fixedSize = 1 + 1 + 4 + 1 + 4;
    const finalSize = fixedSize + linksBuffer.length + 4 + 4 + (this.selfName.length > 0 ? nameHeader.length + nameBuffer.length : 1) + 1 + 1;

    const packet = Buffer.alloc(finalSize);
    let offset = 0;

    packet.writeInt8(this.admin ? 1 : 0, offset);
    offset += 1;
    packet.writeInt8(this.antifloodEnabled ? 1 : 0, offset);
    offset += 1;
    packet.writeInt32BE(this.bufferSize, offset);
    offset += 4;
    packet.writeInt8(this.chatEnabled ? 1 : 0, offset);
    offset += 1;
    packet.writeInt32BE(this.chatModeratorLevel, offset);
    offset += 4;

    linksBuffer.copy(packet, offset);
    offset += linksBuffer.length;

    packet.writeInt32BE(this.minChar, offset);
    offset += 4;
    packet.writeInt32BE(this.minWord, offset);
    offset += 4;

    if (this.selfName.length > 0) {
      nameHeader.copy(packet, offset);
      offset += nameHeader.length;
      nameBuffer.copy(packet, offset);
      offset += nameBuffer.length;
    } else {
      packet.writeInt8(1, offset);
      offset += 1;
    }

    packet.writeInt8(this.showLinks ? 1 : 0, offset);
    offset += 1;
    packet.writeInt8(this.typingSpeedAntifloodEnabled ? 1 : 0, offset);

    return packet;
  }

  toString(): string {
    return `ChatProperties(user: ${this.selfName}, modLevel: ${this.chatModeratorLevel})`;
  }

  static getId(): number {
    return 178154988;
  }
}
