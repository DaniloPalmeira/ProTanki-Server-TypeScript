import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IRequestNextTip } from "../interfaces/IRequestNextTip";
import { BasePacket } from "./BasePacket";

export default class RequestNextTipPacket extends BasePacket implements IRequestNextTip {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return "RequestNextTipPacket()";
  }

  static getId(): number {
    return -1376947245;
  }
}
