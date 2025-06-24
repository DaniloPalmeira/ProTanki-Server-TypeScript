import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IEmpty } from "../interfaces/IEmpty";
import { BasePacket } from "./BasePacket";

export default class ChangePasswordForm extends BasePacket implements IEmpty {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return "ChangePasswordForm()";
  }

  static getId(): number {
    return 600420685;
  }
}
