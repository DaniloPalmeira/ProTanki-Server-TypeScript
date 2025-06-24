import { IEmpty } from "../interfaces/IEmpty";
import { BasePacket } from "./BasePacket";

export default class ChangePasswordForm extends BasePacket implements IEmpty {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return Buffer.alloc(0);
  }

  toString(): string {
    return "ChangePasswordForm()";
  }

  static getId(): number {
    return 600420685;
  }
}
