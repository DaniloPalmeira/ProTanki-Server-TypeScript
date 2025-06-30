import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ILoadBattleChat } from "../interfaces/ILoadBattleChat";
import { BasePacket } from "./BasePacket";

export default class LoadBattleChatPacket extends BasePacket implements ILoadBattleChat {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return "LoadBattleChatPacket()";
  }

  static getId(): number {
    return -643105296;
  }
}
