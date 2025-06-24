import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ICaptchaLocation } from "../interfaces/ICaptchaLocation";
import { BasePacket } from "./BasePacket";

export default class CaptchaLocation extends BasePacket implements ICaptchaLocation {
  captchaLocations: Array<number>;

  constructor(captchaLocations: Array<number>) {
    super();
    this.captchaLocations = captchaLocations;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    const itemsCount = reader.readInt32BE();
    this.captchaLocations = [];
    for (let i = 0; i < itemsCount; i++) {
      this.captchaLocations.push(reader.readInt32BE());
    }
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.captchaLocations.length);
    for (const location of this.captchaLocations) {
      writer.writeInt32BE(location);
    }
    return writer.getBuffer();
  }

  toString(): string {
    return `CaptchaLocation(captchaLocations=${this.captchaLocations})`;
  }

  static getId(): number {
    return 321971701;
  }
}
