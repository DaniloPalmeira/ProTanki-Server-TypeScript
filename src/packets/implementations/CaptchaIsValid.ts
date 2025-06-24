import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ICaptchaView } from "../interfaces/ICaptchaView";
import { BasePacket } from "./BasePacket";

export default class CaptchaIsValid extends BasePacket implements ICaptchaView {
  view: number;

  constructor(view: number) {
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
    return `CaptchaIsValid(view=${this.view})`;
  }

  static getId(): number {
    return -819536476;
  }
}
