import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IConfirmLayoutChange } from "../interfaces/IConfirmLayoutChange";
import { BasePacket } from "./BasePacket";

export default class ConfirmLayoutChange extends BasePacket implements IConfirmLayoutChange {
  fromLayout: number;
  toLayout: number;

  constructor(from: number, to: number) {
    super();
    this.fromLayout = from;
    this.toLayout = to;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
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
