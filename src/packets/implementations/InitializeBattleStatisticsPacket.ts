import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IInitializeBattleStatistics } from "../interfaces/IInitializeBattleStatistics";
import { BasePacket } from "./BasePacket";

export default class InitializeBattleStatisticsPacket extends BasePacket implements IInitializeBattleStatistics {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return "InitializeBattleStatisticsPacket()";
  }

  static getId(): number {
    return 1953272681;
  }
}
