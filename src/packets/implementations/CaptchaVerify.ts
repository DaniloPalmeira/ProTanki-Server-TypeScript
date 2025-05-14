import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { BasePacket } from "./BasePacket";
import CaptchaIsValid from "./CaptchaIsValid";
import CaptchaIsInvalid from "./CaptchaIsInvalid";
import generateCaptcha from "../../utils/GenerateCaptcha";
import { ICaptchaVerify } from "../interfaces/ICaptchaVerify";

export default class CaptchaVerify
  extends BasePacket
  implements ICaptchaVerify
{
  view: number;
  solution: string;

  constructor(view: number, solution: string) {
    super();
    this.view = view;
    this.solution = solution;
  }

  read(buffer: Buffer): void {
    let position = 0;
    this.view = buffer.readInt32BE(position);
    position += 4;
    const isEmpty = buffer.readInt8(position);
    position += 1;
    if (!isEmpty) {
      const len = buffer.readInt32BE(position);
      position += 4;
      this.solution = buffer.toString("utf8", position, position + len);
    }
  }

  write(): Buffer {
    const packetSize =
      4 + 1 + (this.solution.length > 0 ? 4 + this.solution.length : 0);
    const packet = Buffer.alloc(packetSize);
    let position = 0;
    packet.writeInt32BE(this.view, position);
    position += 4;
    packet.writeInt8(this.solution.length > 0 ? 0 : 1, position);
    position += 1;
    if (this.solution.length > 0) {
      packet.writeInt32BE(this.solution.length, position);
      position += 4;
      Buffer.from(this.solution, "utf8").copy(packet, position);
    }
    return packet;
  }

  run(server: ProTankiServer, client: ProTankiClient): void {
    if (client.captchaSolution === this.solution.toLowerCase()) {
      client.sendPacket(new CaptchaIsValid(this.view));
      return;
    }

    const captcha = generateCaptcha();
    client.captchaSolution = captcha.text;
    client.sendPacket(new CaptchaIsInvalid(this.view, captcha.image));
  }

  toString(): string {
    return `CaptchaVerify(view=${this.view},solution=${this.solution})`;
  }

  getId(): number {
    return 1271163230;
  }
}
