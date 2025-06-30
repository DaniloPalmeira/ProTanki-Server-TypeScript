import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ITimeChecker } from "../interfaces/ITimeChecker";
import { BasePacket } from "./BasePacket";

export default class TimeCheckerPacket extends BasePacket implements ITimeChecker {
  value1: number;
  value2: number;

  constructor(value1: number = 0, value2: number = 0) {
    super();
    this.value1 = value1;
    this.value2 = value2;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.value1 = reader.readInt32BE();
    this.value2 = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.value1);
    writer.writeInt32BE(this.value2);
    return writer.getBuffer();
  }

  toString(): string {
    return `TimeCheckerPacket(value1=${this.value1}, value2=${this.value2})`;
  }

  static getId(): number {
    return 34068208;
  }
}
