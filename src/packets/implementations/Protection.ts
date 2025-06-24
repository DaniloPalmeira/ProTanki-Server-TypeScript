import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IProtection } from "../interfaces/IProtection";
import { BasePacket } from "./BasePacket";

export default class Protection extends BasePacket implements IProtection {
  keys: Array<number>;

  constructor(keys: Array<number>) {
    super();
    this.keys = keys;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    const length = reader.readInt32BE();
    this.keys = [];
    for (let i = 0; i < length; i++) {
      this.keys.push(reader.readInt8());
    }
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.keys.length);
    this.keys.forEach((val) => {
      writer.writeInt8(val);
    });
    return writer.getBuffer();
  }

  toString(): string {
    return `Protection(keys=${this.keys})`;
  }

  static getId(): number {
    return 2001736388;
  }
}
