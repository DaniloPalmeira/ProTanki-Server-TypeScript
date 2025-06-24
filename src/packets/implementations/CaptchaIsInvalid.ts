import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { ICaptcha } from "../interfaces/ICaptcha";
import { BasePacket } from "./BasePacket";

export default class CaptchaIsInvalid extends BasePacket implements ICaptcha {
  view: number;
  image: Buffer;

  constructor(view: number, image: Buffer) {
    super();
    this.view = view;
    this.image = image;
  }

  read(buffer: Buffer): void {
    this.view = buffer.readInt32BE(0);
    const imageLen = buffer.readInt32BE(4);
    this.image = buffer.subarray(8, 8 + imageLen);
  }

  write(): Buffer {
    const packetSize = 4 + 4 + this.image.length;
    const packet = Buffer.alloc(packetSize);

    packet.writeInt32BE(this.view, 0);
    packet.writeInt32BE(this.image.length, 4);
    this.image.copy(packet, 8);

    return packet;
  }

  toString(): string {
    return `Captcha(view=${this.view}, image=${this.image.toString("hex")}`;
  }

  static getId(): number {
    return -373510957;
  }
}
