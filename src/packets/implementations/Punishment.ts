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
    let bufferParts: Buffer[] = [];

    // Reason
    const isReasonEmpty = !this.reason;
    bufferParts.push(Buffer.from([isReasonEmpty ? 1 : 0]));
    if (!isReasonEmpty) {
      const reasonBuffer = Buffer.from(this.reason!, "utf8");
      const reasonLengthBuffer = Buffer.alloc(4);
      reasonLengthBuffer.writeInt32BE(reasonBuffer.length, 0);
      bufferParts.push(reasonLengthBuffer, reasonBuffer);
    }

    // Time parts
    const timeBuffer = Buffer.alloc(4 * 3);
    timeBuffer.writeInt32BE(this.minutes, 0);
    timeBuffer.writeInt32BE(this.hours, 4);
    timeBuffer.writeInt32BE(this.days, 8);
    bufferParts.push(timeBuffer);

    return Buffer.concat(bufferParts);
  }

  toString(): string {
    return `Punishment(reason=${this.reason}, days=${this.days}, hours=${this.hours}, minutes=${this.minutes})`;
  }

  static getId(): number {
    return 1200280053;
  }
}
