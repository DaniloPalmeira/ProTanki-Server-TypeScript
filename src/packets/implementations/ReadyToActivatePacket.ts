import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IReadyToActivate } from "../interfaces/IReadyToActivate";
import { BasePacket } from "./BasePacket";

export default class ReadyToActivatePacket extends BasePacket implements IReadyToActivate {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return "ReadyToActivatePacket()";
  }

  static getId(): number {
    return 1178028365;
  }
}
