import { IEmpty } from "../interfaces/IEmpty";
import { BasePacket } from "./BasePacket";

export default class RequestChangePasswordForm extends BasePacket implements IEmpty {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return Buffer.alloc(0);
  }

  toString(): string {
    return "RequestChangePasswordForm()";
  }

  static getId(): number {
    return -1507635228;
  }
}
