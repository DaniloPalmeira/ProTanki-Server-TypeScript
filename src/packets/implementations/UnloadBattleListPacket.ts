import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IUnloadBattleList } from "../interfaces/IUnloadBattleList";
import { BasePacket } from "./BasePacket";

export default class UnloadBattleListPacket extends BasePacket implements IUnloadBattleList {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return "UnloadBattleListPacket()";
  }

  static getId(): number {
    return -324155151;
  }
}
