import { IAntifloodSettings } from "../interfaces/IAntifloodSettings";
import { BasePacket } from "./BasePacket";

export default class AntifloodSettings extends BasePacket implements IAntifloodSettings {
  charDelayFactor: number;
  messageBaseDelay: number;

  constructor(charDelayFactor: number, messageBaseDelay: number) {
    super();
    this.charDelayFactor = charDelayFactor;
    this.messageBaseDelay = messageBaseDelay;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  write(): Buffer {
    const packet = Buffer.alloc(8);
    packet.writeInt32BE(this.charDelayFactor, 0);
    packet.writeInt32BE(this.messageBaseDelay, 4);
    return packet;
  }

  toString(): string {
    return `AntifloodSettings(charDelayFactor=${this.charDelayFactor}, messageBaseDelay=${this.messageBaseDelay})`;
  }

  getId(): number {
    return 744948472;
  }
}
