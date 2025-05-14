import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { generateCaptcha } from "../../utils/Captcha";
import { ICaptcha } from "../interfaces/ICaptcha";
import { BasePacket } from "./BasePacket";

export default class Captcha extends BasePacket implements ICaptcha {
  view: number;
  image: Buffer;

  constructor(view: number, image: Buffer) {
    super();
    this.view = view;
    this.image = image;
  }

  read(buffer: Buffer): void {
    let position = 0;
    this.view = buffer.readInt32BE(position);
    position += 4;
    const imageLen = buffer.readInt32BE(position);
    position += 4;
    this.image = buffer.subarray(position, position + imageLen);
  }

  write(): Buffer {
    const packetSize = 4 + 4 + this.image.length;
    const packet = Buffer.alloc(packetSize);

    let position = 0;
    packet.writeInt32BE(this.view, position);
    position += 4;
    packet.writeInt32BE(this.image.length, position);
    position += 4;
    this.image.copy(packet, position);

    return packet;
  }

  toString(): string {
    return `Captcha: ${this.view}`;
  }

  getId(): number {
    return -1670408519;
  }
}
