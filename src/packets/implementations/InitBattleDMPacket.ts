import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IInitBattleDM } from "../interfaces/IInitBattleDM";
import { BasePacket } from "./BasePacket";

export default class InitBattleDMPacket extends BasePacket implements IInitBattleDM {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return "InitBattleDMPacket()";
  }

  static getId(): number {
    return 930618015;
  }
}
