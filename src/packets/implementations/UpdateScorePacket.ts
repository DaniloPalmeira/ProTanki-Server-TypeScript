import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IUpdateScore } from "../interfaces/IUpdateScore";
import { BasePacket } from "./BasePacket";

export default class UpdateScorePacket extends BasePacket implements IUpdateScore {
  score: number;

  constructor(score: number = 0) {
    super();
    this.score = score;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.score = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.score);
    return writer.getBuffer();
  }

  toString(): string {
    return `UpdateScorePacket(score=${this.score})`;
  }

  static getId(): number {
    return 2116086491;
  }
}
