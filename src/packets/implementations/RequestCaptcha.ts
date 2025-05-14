import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IRequestCaptcha } from "../interfaces/IRequestCaptcha";
import { BasePacket } from "./BasePacket";
import generateCaptcha from "../../utils/GenerateCaptcha";
import Captcha from "./Captcha";

export default class RequestCaptcha
  extends BasePacket
  implements IRequestCaptcha
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
    const packet = Buffer.alloc(4);
    packet.writeInt32BE(this.view);

    return packet;
  }

  run(server: ProTankiServer, client: ProTankiClient): void {
    const captcha = generateCaptcha();
    client.captchaSolution = captcha.text;
    client.sendPacket(new Captcha(this.view, captcha.image));
  }

  toString(): string {
    return `RequestCaptcha(view=${this.view})`;
  }

  getId(): number {
    return -349828108;
  }
}
