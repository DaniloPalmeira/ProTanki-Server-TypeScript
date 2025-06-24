import { BufferWriter } from "../../utils/buffer/BufferWriter";
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
    const writer = new BufferWriter();
    writer.writeInt32BE(this.rank);
    writer.writeOptionalString(this.nickname);
    return writer.getBuffer();
  }

  toString(): string {
    return `RankNotifierData(nickname=${this.nickname}, rank=${this.rank})`;
  }

  static getId(): number {
    return -962759489;
  }
}
