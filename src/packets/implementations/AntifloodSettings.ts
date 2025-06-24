import { BufferWriter } from "../../utils/buffer/BufferWriter";
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
