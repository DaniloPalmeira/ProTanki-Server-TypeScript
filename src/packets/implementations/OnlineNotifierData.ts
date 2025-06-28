import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IOnlineNotifierData } from "../interfaces/IOnlineNotifierData";
import { BasePacket } from "./BasePacket";

export default class OnlineNotifierData extends BasePacket implements IOnlineNotifierData {
  isOnline: boolean = false;
  server: number = 0;
  nickname: string = "";

  constructor(isOnline?: boolean, server?: number, nickname?: string) {
    super();
    if (isOnline !== undefined) {
      this.isOnline = isOnline;
    }
    if (server !== undefined) {
      this.server = server;
    }
    if (nickname) {
      this.nickname = nickname;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.isOnline = reader.readUInt8() === 1;
    this.server = reader.readInt32BE();
    this.nickname = reader.readOptionalString() ?? "";
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeUInt8(this.isOnline ? 1 : 0);
    writer.writeInt32BE(this.server);
    writer.writeOptionalString(this.nickname);
    return writer.getBuffer();
  }

  toString(): string {
    return `OnlineNotifierData(isOnline=${this.isOnline}, server=${this.server}, nickname='${this.nickname}')`;
  }

  static getId(): number {
    return 2041598093;
  }
}
