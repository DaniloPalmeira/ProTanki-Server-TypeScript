import { BasePacket } from "./BasePacket";
import { ICaptchaVerify } from "../interfaces/ICaptchaVerify";

export default class CaptchaVerify extends BasePacket implements ICaptchaVerify {
  view: number;
  solution: string;

  constructor(view: number, solution: string) {
    super();
    this.view = view;
    this.solution = solution;
  }

  read(buffer: Buffer): void {
    this.view = buffer.readInt32BE(0);
    const isEmpty = buffer.readInt8(4);
    if (!isEmpty) {
      const len = buffer.readInt32BE(5);
      this.solution = buffer.toString("utf8", 9, 9 + len);
    }
  }

  write(): Buffer {
    const packetSize = 4 + 1 + (this.solution.length > 0 ? 4 + this.solution.length : 0);
    const packet = Buffer.alloc(packetSize);
    packet.writeInt32BE(this.view, 0);
    packet.writeInt8(this.solution.length > 0 ? 0 : 1, 4);
    if (this.solution.length > 0) {
      packet.writeInt32BE(this.solution.length, 5);
      Buffer.from(this.solution, "utf8").copy(packet, 9);
    }
    return packet;
  }

  toString(): string {
    return `CaptchaVerify(view=${this.view},solution=${this.solution})`;
  }

  static getId(): number {
    return 1271163230;
  }
}
