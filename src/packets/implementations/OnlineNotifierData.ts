import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IOnlineNotifierData } from "../interfaces/IOnlineNotifierData";
import { BasePacket } from "./BasePacket";

export default class OnlineNotifierData extends BasePacket implements IOnlineNotifierData {
  isOnline: boolean;
  server: number;
  nickname: string;

  constructor(isOnline: boolean, server: number, nickname: string) {
    super();
    this.isOnline = isOnline;
    this.server = server;
    this.nickname = nickname;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeUInt8(this.isOnline ? 1 : 0);
    writer.writeInt32BE(this.server);
    writer.writeOptionalString(this.nickname);
    return writer.getBuffer();
  }

  toString(): string {
    return `OnlineNotifierData(nickname=${this.nickname}, isOnline=${this.isOnline})`;
  }

  static getId(): number {
    return 2041598093;
  }
}
