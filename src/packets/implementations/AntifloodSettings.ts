import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IAntifloodSettings } from "../interfaces/IAntifloodSettings";
import { BasePacket } from "./BasePacket";

export default class AntifloodSettings extends BasePacket implements IAntifloodSettings {
  charDelayFactor: number = 0;
  messageBaseDelay: number = 0;

  constructor(charDelayFactor?: number, messageBaseDelay?: number) {
    super();
    if (charDelayFactor !== undefined) {
      this.charDelayFactor = charDelayFactor;
    }
    if (messageBaseDelay !== undefined) {
      this.messageBaseDelay = messageBaseDelay;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.charDelayFactor = reader.readInt32BE();
    this.messageBaseDelay = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.charDelayFactor);
    writer.writeInt32BE(this.messageBaseDelay);
    return writer.getBuffer();
  }

  toString(): string {
    return `AntifloodSettings(charDelayFactor=${this.charDelayFactor}, messageBaseDelay=${this.messageBaseDelay})`;
  }

  static getId(): number {
    return 744948472;
  }
}
