import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IEnterBattleAsSpectator } from "../interfaces/IEnterBattleAsSpectator";
import { BasePacket } from "./BasePacket";

export default class EnterBattleAsSpectatorPacket extends BasePacket implements IEnterBattleAsSpectator {
  public read(buffer: Buffer): void {}

  public write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  public toString(): string {
    return "EnterBattleAsSpectatorPacket()";
  }

  public static getId(): number {
    return -1315002220;
  }
}
