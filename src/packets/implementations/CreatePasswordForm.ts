import { IEmpty } from "../interfaces/IEmpty";
import { BasePacket } from "./BasePacket";

export default class CreatePasswordForm extends BasePacket implements IEmpty {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return Buffer.alloc(0);
  }

  toString(): string {
    return "CreatePasswordForm()";
  }

  static getId(): number {
    return 133238100;
  }
}
