import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ISuicidePacket } from "../interfaces/ISuicidePacket";
import { BasePacket } from "./BasePacket";

export default class SuicidePacket extends BasePacket implements ISuicidePacket {
  public read(buffer: Buffer): void {}

  public write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  public toString(): string {
    return "SuicidePacket()";
  }

  public static getId(): number {
    return 988664577;
  }
}
