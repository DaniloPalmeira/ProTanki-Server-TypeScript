import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { ICaptchaLocation } from "../interfaces/ICaptchaLocation";
import { BasePacket } from "./BasePacket";

export default class CaptchaLocation
  extends BasePacket
  implements ICaptchaLocation
{
  captchaLocations: Array<number>;

  constructor(captchaLocations: Array<number>) {
    super();
    this.captchaLocations = captchaLocations;

    // 0 = LOGIN_FORM
    // 1 = REGISTER_FORM
    // 2 = CLIENT_STARTUP
    // 3 = RESTORE_PASSWORD_FORM
    // 4 = EMAIL_CHANGE_HASH
    // 5 = ACCOUNT_SETTINGS_FORM
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

  toString(): string {
    return `CaptchaLocation(captchaLocations=${this.captchaLocations})`;
  }

  getId(): number {
    return 321971701;
  }
}
