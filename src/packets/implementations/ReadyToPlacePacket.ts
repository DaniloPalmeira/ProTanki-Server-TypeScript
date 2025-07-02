import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IReadyToPlace } from "../interfaces/IReadyToPlace";
import { BasePacket } from "./BasePacket";

export default class ReadyToPlacePacket extends BasePacket implements IReadyToPlace {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return "ReadyToPlacePacket()";
  }

  static getId(): number {
    return -1378839846;
  }
}
