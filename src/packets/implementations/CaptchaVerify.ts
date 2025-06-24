import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { ICaptchaVerify } from "../interfaces/ICaptchaVerify";

export default class CaptchaVerify extends BasePacket implements ICaptchaVerify {
  view: number;
  solution: string | null;

  constructor(view: number = 0, solution: string | null) {
    super();
    this.view = view;
    this.solution = solution;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.view = reader.readInt32BE();
    this.solution = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.view);
    writer.writeOptionalString(this.solution);
    return writer.getBuffer();
  }

  toString(): string {
    return `CaptchaVerify(view=${this.view},solution=${this.solution})`;
  }

  static getId(): number {
    return 1271163230;
  }
}
