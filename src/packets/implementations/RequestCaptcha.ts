import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IRequestCaptcha } from "../interfaces/IRequestCaptcha";
import { BasePacket } from "./BasePacket";

export default class RequestCaptcha extends BasePacket implements IRequestCaptcha {
  view: number;

  constructor(view: number = 0) {
    super();
    this.view = view;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.view = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.view);
    return writer.getBuffer();
  }

  toString(): string {
    return `RequestCaptcha(view=${this.view})`;
  }

  static getId(): number {
    return -349828108;
  }
}
