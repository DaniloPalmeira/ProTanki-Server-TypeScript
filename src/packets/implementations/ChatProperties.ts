import { BufferWriter } from "../../utils/buffer/BufferWriter";
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

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeUInt8(this.admin ? 1 : 0);
    writer.writeUInt8(this.antifloodEnabled ? 1 : 0);
    writer.writeInt32BE(this.bufferSize);
    writer.writeUInt8(this.chatEnabled ? 1 : 0);
    writer.writeInt32BE(this.chatModeratorLevel);
    writer.writeStringArray(this.linksWhiteList);
    writer.writeInt32BE(this.minChar);
    writer.writeInt32BE(this.minWord);
    writer.writeOptionalString(this.selfName);
    writer.writeUInt8(this.showLinks ? 1 : 0);
    writer.writeUInt8(this.typingSpeedAntifloodEnabled ? 1 : 0);
    return writer.getBuffer();
  }

  toString(): string {
    return `ChatProperties(user: ${this.selfName}, modLevel: ${this.chatModeratorLevel})`;
  }

  static getId(): number {
    return 178154988;
  }
}
