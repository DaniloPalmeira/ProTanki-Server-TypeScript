import { IEmpty } from "../interfaces/IEmpty";
import { BasePacket } from "./BasePacket";

export default class RequestSettings extends BasePacket implements IEmpty {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return Buffer.alloc(0);
  }

  toString(): string {
    return "RequestSettings()";
  }

  static getId(): number {
    return 850220815;
  }
}
