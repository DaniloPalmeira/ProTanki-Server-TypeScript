import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IRemoveBattleInfo } from "../interfaces/IRemoveBattleInfo";
import { BasePacket } from "./BasePacket";

export default class RemoveBattleInfoPacket extends BasePacket implements IRemoveBattleInfo {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return "RemoveBattleInfoPacket()";
  }

  static getId(): number {
    return -324155151;
  }
}
