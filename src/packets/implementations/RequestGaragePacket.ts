import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IRequestGarage } from "../interfaces/IRequestGarage";
import { BasePacket } from "./BasePacket";

export default class RequestGaragePacket extends BasePacket implements IRequestGarage {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return "RequestGaragePacket()";
  }

  static getId(): number {
    return -479046431;
  }
}
