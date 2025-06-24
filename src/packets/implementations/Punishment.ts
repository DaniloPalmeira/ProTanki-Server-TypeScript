import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IPunishment } from "../interfaces/IPunishment";
import { BasePacket } from "./BasePacket";

export default class Punishment extends BasePacket implements IPunishment {
  reason: string | null;
  days: number;
  hours: number;
  minutes: number;

  constructor(reason: string | null, days: number, hours: number, minutes: number) {
    super();
    this.reason = reason;
    this.days = days;
    this.hours = hours;
    this.minutes = minutes;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.reason);
    writer.writeInt32BE(this.minutes);
    writer.writeInt32BE(this.hours);
    writer.writeInt32BE(this.days);
    return writer.getBuffer();
  }

  toString(): string {
    return `Punishment(reason=${this.reason}, days=${this.days}, hours=${this.hours}, minutes=${this.minutes})`;
  }

  static getId(): number {
    return 1200280053;
  }
}
