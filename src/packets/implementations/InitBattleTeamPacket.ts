import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IInitBattleTeam } from "../interfaces/IInitBattleTeam";
import { BasePacket } from "./BasePacket";

export default class InitBattleTeamPacket extends BasePacket implements IInitBattleTeam {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return "InitBattleTeamPacket()";
  }

  static getId(): number {
    return 183561709;
  }
}
