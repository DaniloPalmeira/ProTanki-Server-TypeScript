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
    console.log(
      `Captcha valida: ${
        client.captchaSolution === this.solution.toLowerCase()
      } ${client.captchaSolution} ${this.solution}`
    );
  }

  toString(): string {
    return `RequestCaptcha: ${this.view}`;
  }

  getId(): number {
    return 1271163230;
  }
}
