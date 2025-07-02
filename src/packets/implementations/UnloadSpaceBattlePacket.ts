import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IUnloadSpaceBattle } from "../interfaces/IUnloadSpaceBattle";
import { BasePacket } from "./BasePacket";

export default class UnloadSpaceBattlePacket extends BasePacket implements IUnloadSpaceBattle {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return "UnloadSpaceBattlePacket()";
  }

  static getId(): number {
    return -985579124;
  }
}
