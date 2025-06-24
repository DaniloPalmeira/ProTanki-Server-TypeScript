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
    const packet = Buffer.alloc(8);
    packet.writeInt32BE(this.fromLayout, 0);
    packet.writeInt32BE(this.toLayout, 4);
    return packet;
  }

  toString(): string {
    return `ConfirmLayoutChange(from=${this.fromLayout}, to=${this.toLayout})`;
  }

  getId(): number {
    return -593368100;
  }
}
