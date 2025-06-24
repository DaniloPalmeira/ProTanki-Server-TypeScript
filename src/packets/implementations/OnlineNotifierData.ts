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
    const nickBuffer = Buffer.from(this.nickname, "utf8");
    const packet = Buffer.alloc(1 + 4 + 1 + 4 + nickBuffer.length);
    let offset = 0;

    packet.writeInt8(this.isOnline ? 1 : 0, offset);
    offset += 1;
    packet.writeInt32BE(this.server, offset);
    offset += 4;

    packet.writeInt8(0, offset);
    offset += 1;
    packet.writeInt32BE(nickBuffer.length, offset);
    offset += 4;
    nickBuffer.copy(packet, offset);

    return packet;
  }

  toString(): string {
    return `OnlineNotifierData(nickname=${this.nickname}, isOnline=${this.isOnline})`;
  }

  static getId(): number {
    return 2041598093;
  }
}
