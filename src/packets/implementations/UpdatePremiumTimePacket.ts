import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IUpdatePremiumTime } from "../interfaces/IUpdatePremiumTime";
import { BasePacket } from "./BasePacket";

export default class UpdatePremiumTimePacket extends BasePacket implements IUpdatePremiumTime {
  timeLeft: number = 0;

  constructor(timeLeft?: number) {
    super();
    if (timeLeft !== undefined) {
      this.timeLeft = timeLeft;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.timeLeft = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.timeLeft);
    return writer.getBuffer();
  }

  toString(): string {
    return `UpdatePremiumTimePacket(timeLeft=${this.timeLeft})`;
  }

  static getId(): number {
    return 1391146385;
  }
}
