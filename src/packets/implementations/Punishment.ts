import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IPunishment } from "../interfaces/IPunishment";
import { BasePacket } from "./BasePacket";

export default class Punishment extends BasePacket implements IPunishment {
  reason: string | null = null;
  days: number = 0;
  hours: number = 0;
  minutes: number = 0;

  constructor(reason?: string | null, days?: number, hours?: number, minutes?: number) {
    super();
    if (reason) {
      this.reason = reason;
    }
    if (days !== undefined) {
      this.days = days;
    }
    if (hours !== undefined) {
      this.hours = hours;
    }
    if (minutes !== undefined) {
      this.minutes = minutes;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.reason = reader.readOptionalString();
    this.minutes = reader.readInt32BE();
    this.hours = reader.readInt32BE();
    this.days = reader.readInt32BE();
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
    return `Punishment(reason='${this.reason}', days=${this.days}, hours=${this.hours}, minutes=${this.minutes})`;
  }

  static getId(): number {
    return 1200280053;
  }
}
