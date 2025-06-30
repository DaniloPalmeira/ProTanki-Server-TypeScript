import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IUnloadGarage } from "../interfaces/IUnloadGarage";
import { BasePacket } from "./BasePacket";

export default class UnloadGaragePacket extends BasePacket implements IUnloadGarage {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return "UnloadGaragePacket()";
  }

  static getId(): number {
    return 1211186637;
  }
}
