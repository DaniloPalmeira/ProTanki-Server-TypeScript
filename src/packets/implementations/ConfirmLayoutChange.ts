import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IConfirmLayoutChange } from "../interfaces/IConfirmLayoutChange";
import { BasePacket } from "./BasePacket";

export default class ConfirmLayoutChange extends BasePacket implements IConfirmLayoutChange {
  fromLayout: number = 0;
  toLayout: number = 0;

  constructor(from?: number, to?: number) {
    super();
    if (from !== undefined) {
      this.fromLayout = from;
    }
    if (to !== undefined) {
      this.toLayout = to;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.fromLayout = reader.readInt32BE();
    this.toLayout = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.fromLayout);
    writer.writeInt32BE(this.toLayout);
    return writer.getBuffer();
  }

  toString(): string {
    return `ConfirmLayoutChange(from=${this.fromLayout}, to=${this.toLayout})`;
  }

  static getId(): number {
    return -593368100;
  }
}
