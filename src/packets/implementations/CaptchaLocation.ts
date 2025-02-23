import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { ICaptchaLocation } from "../interfaces/ICaptchaLocation";

export default class CaptchaLocation implements ICaptchaLocation {
  captchaLocations: Array<number>;

  constructor(captchaLocations: Array<number>) {
    this.captchaLocations = captchaLocations;
  }

  read(buffer: Buffer): void {
    const ItemsCount = buffer.readInt32BE(0);
    this.captchaLocations = [];
    for (let i = 0; i < ItemsCount; i++) {
      this.captchaLocations.push(buffer.readInt32BE(4 + i * 4));
    }
  }

  write(): Buffer {
    const ItemsCount = this.captchaLocations.length;
    const packet = Buffer.alloc(4 + ItemsCount * 4);
    packet.writeInt32BE(ItemsCount, 0);
    for (let i = 0; i < ItemsCount; i++) {
      packet.writeInt32BE(this.captchaLocations[i], 4 + i * 4);
    }
    return packet;
  }

  run(server: ProTankiServer, client: ProTankiClient): void {}

  toString(): string {
    return `CaptchaLocation(captchaLocations: ${this.captchaLocations})`;
  }

  getId(): number {
    return 321971701;
  }
}
