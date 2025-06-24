import { IRankNotifierData } from "../interfaces/IRankNotifierData";
import { BasePacket } from "./BasePacket";

export default class RankNotifierData extends BasePacket implements IRankNotifierData {
  rank: number;
  nickname: string;

  constructor(rank: number, nickname: string) {
    super();
    this.rank = rank;
    this.nickname = nickname;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  write(): Buffer {
    const nickBuffer = Buffer.from(this.nickname, "utf8");
    const packet = Buffer.alloc(4 + 1 + 4 + nickBuffer.length);
    let offset = 0;

    packet.writeInt32BE(this.rank, offset);
    offset += 4;

    packet.writeInt8(0, offset);
    offset += 1;
    packet.writeInt32BE(nickBuffer.length, offset);
    offset += 4;
    nickBuffer.copy(packet, offset);

    return packet;
  }

  toString(): string {
    return `RankNotifierData(nickname=${this.nickname}, rank=${this.rank})`;
  }

  static getId(): number {
    return -962759489;
  }
}
