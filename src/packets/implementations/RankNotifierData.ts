import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IRankNotifierData } from "../interfaces/IRankNotifierData";
import { BasePacket } from "./BasePacket";

export default class RankNotifierData extends BasePacket implements IRankNotifierData {
  rank: number = 0;
  nickname: string = "";

  constructor(rank?: number, nickname?: string) {
    super();
    if (rank !== undefined) {
      this.rank = rank;
    }
    if (nickname) {
      this.nickname = nickname;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.rank = reader.readInt32BE();
    this.nickname = reader.readOptionalString() ?? "";
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.rank);
    writer.writeOptionalString(this.nickname);
    return writer.getBuffer();
  }

  toString(): string {
    return `RankNotifierData(nickname='${this.nickname}', rank=${this.rank})`;
  }

  static getId(): number {
    return -962759489;
  }
}
