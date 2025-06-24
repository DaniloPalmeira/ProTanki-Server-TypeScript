import { IRequestCaptcha } from "../interfaces/IRequestCaptcha";
import { BasePacket } from "./BasePacket";

export default class RequestCaptcha extends BasePacket implements IRequestCaptcha {
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

  toString(): string {
    return `RequestCaptcha(view=${this.view})`;
  }

  static getId(): number {
    return -349828108;
  }
}
