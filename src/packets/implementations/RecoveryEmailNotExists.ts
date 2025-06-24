import { IEmpty } from "../interfaces/IEmpty";
import { BasePacket } from "./BasePacket";

export default class RecoveryEmailNotExists extends BasePacket implements IEmpty {
  read(buffer: Buffer): void {}

  write(): Buffer {
    const packet = Buffer.alloc(0);

    return packet;
  }

  toString(): string {
    return `RecoveryEmailNotExists()`;
  }

  static getId(): number {
    return -262455387;
  }
}
