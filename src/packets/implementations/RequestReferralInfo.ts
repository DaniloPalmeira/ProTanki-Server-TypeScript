import { IEmpty } from "../interfaces/IEmpty";
import { BasePacket } from "./BasePacket";

export default class RequestReferralInfo extends BasePacket implements IEmpty {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return Buffer.alloc(0);
  }

  toString(): string {
    return "RequestReferralInfo()";
  }

  static getId(): number {
    return -169921234;
  }
}
