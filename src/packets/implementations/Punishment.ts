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
    const isReasonEmpty = !this.reason;
    const reasonBuffer = isReasonEmpty ? null : Buffer.from(this.reason!, "utf8");
    const reasonSize = isReasonEmpty ? 1 : 1 + 4 + reasonBuffer!.length;
    const timeSize = 4 * 3;
    const totalSize = reasonSize + timeSize;

    const packet = Buffer.alloc(totalSize);
    let offset = 0;

    offset = packet.writeUInt8(isReasonEmpty ? 1 : 0, offset);
    if (!isReasonEmpty) {
      offset = packet.writeInt32BE(reasonBuffer!.length, offset);
      reasonBuffer!.copy(packet, offset);
      offset += reasonBuffer!.length;
    }

    offset = packet.writeInt32BE(this.minutes, offset);
    offset = packet.writeInt32BE(this.hours, offset);
    offset = packet.writeInt32BE(this.days, offset);

    return packet;
  }

  toString(): string {
    return `Punishment(reason=${this.reason}, days=${this.days}, hours=${this.hours}, minutes=${this.minutes})`;
  }

  static getId(): number {
    return 1200280053;
  }
}
