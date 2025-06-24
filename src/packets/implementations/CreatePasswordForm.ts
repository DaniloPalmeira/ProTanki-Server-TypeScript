import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IEmpty } from "../interfaces/IEmpty";
import { BasePacket } from "./BasePacket";

export default class CreatePasswordForm extends BasePacket implements IEmpty {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return "CreatePasswordForm()";
  }

  static getId(): number {
    return 133238100;
  }
}
