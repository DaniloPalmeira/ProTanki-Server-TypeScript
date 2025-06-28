import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IChatProperties, IChatPropertiesProps } from "../interfaces/IChatProperties";
import { BasePacket } from "./BasePacket";
import { ChatModeratorLevel } from "../../models/enums/ChatModeratorLevel";

export default class ChatProperties extends BasePacket implements IChatProperties {
  admin: boolean = false;
  antifloodEnabled: boolean = false;
  bufferSize: number = 0;
  chatEnabled: boolean = false;
  chatModeratorLevel: number = ChatModeratorLevel.NONE;
  linksWhiteList: string[] = [];
  minChar: number = 0;
  minWord: number = 0;
  selfName: string = "";
  showLinks: boolean = false;
  typingSpeedAntifloodEnabled: boolean = false;

  constructor(data?: IChatPropertiesProps) {
    super();
    if (data) {
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
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.admin = reader.readUInt8() === 1;
    this.antifloodEnabled = reader.readUInt8() === 1;
    this.bufferSize = reader.readInt32BE();
    this.chatEnabled = reader.readUInt8() === 1;
    this.chatModeratorLevel = reader.readInt32BE();
    this.linksWhiteList = reader.readStringArray();
    this.minChar = reader.readInt32BE();
    this.minWord = reader.readInt32BE();
    this.selfName = reader.readOptionalString() ?? "";
    this.showLinks = reader.readUInt8() === 1;
    this.typingSpeedAntifloodEnabled = reader.readUInt8() === 1;
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
    return (
      `ChatProperties(\n` +
      `  admin=${this.admin},\n` +
      `  antifloodEnabled=${this.antifloodEnabled},\n` +
      `  bufferSize=${this.bufferSize},\n` +
      `  chatEnabled=${this.chatEnabled},\n` +
      `  chatModeratorLevel=${this.chatModeratorLevel},\n` +
      `  linksWhiteList=[${this.linksWhiteList.join(", ")}],\n` +
      `  minChar=${this.minChar},\n` +
      `  minWord=${this.minWord},\n` +
      `  selfName='${this.selfName}',\n` +
      `  showLinks=${this.showLinks},\n` +
      `  typingSpeedAntifloodEnabled=${this.typingSpeedAntifloodEnabled}\n` +
      `)`
    );
  }

  static getId(): number {
    return 178154988;
  }
}
