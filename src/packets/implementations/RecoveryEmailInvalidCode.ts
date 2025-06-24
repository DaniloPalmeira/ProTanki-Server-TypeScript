import { IEmpty } from "../interfaces/IEmpty";
import { BasePacket } from "./BasePacket";

export default class RecoveryEmailInvalidCode extends BasePacket implements IEmpty {
  read(buffer: Buffer): void {}

  write(): Buffer {
    const packet = Buffer.alloc(0);

    return packet;
  }

  toString(): string {
    return `RecoveryEmailInvalidCode()`;
  }

  static getId(): number {
    return -16447159;
  }
}
