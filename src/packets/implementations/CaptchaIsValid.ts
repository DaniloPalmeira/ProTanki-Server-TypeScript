import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { ICaptchaView } from "../interfaces/ICaptchaView";
import { BasePacket } from "./BasePacket";

export default class CaptchaIsValid
  extends BasePacket
  implements ICaptchaView
{
  view: number;

  constructor(view: number) {
    super();
    this.view = view;
  }

  read(buffer: Buffer): void {
    this.view = buffer.readInt32BE(0);
  }

  write(): Buffer {
    const packetSize = 4;
    const packet = Buffer.alloc(packetSize);
    packet.writeInt32BE(this.view, 0);
    return packet;
  }

  toString(): string {
    return `CaptchaIsValid(view=${this.view})`;
  }

  getId(): number {
    return -819536476;
  }
}
