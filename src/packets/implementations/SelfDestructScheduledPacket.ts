import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ISelfDestructScheduled } from "../interfaces/ISelfDestructScheduled";
import { BasePacket } from "./BasePacket";

export default class SelfDestructScheduledPacket extends BasePacket implements ISelfDestructScheduled {
  time: number;

  constructor(time: number = 0) {
    super();
    this.time = time;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.time = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.time);
    return writer.getBuffer();
  }

  toString(): string {
    return `SelfDestructScheduledPacket(time=${this.time})`;
  }

  static getId(): number {
    return -911983090;
  }
}
