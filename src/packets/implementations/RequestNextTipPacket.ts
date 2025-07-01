import { IRequestNextTip } from "../interfaces/IRequestNextTip";
import { BasePacket } from "./BasePacket";

export default class RequestNextTipPacket extends BasePacket implements IRequestNextTip {
  read(buffer: Buffer): void {}

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return "RequestNextTipPacket()";
  }

  static getId(): number {
    return -1376947245;
  }
}
