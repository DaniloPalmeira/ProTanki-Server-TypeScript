import { BufferReader } from "../../utils/buffer/BufferReader";
import { IExitFromBattle } from "../interfaces/IExitFromBattle";
import { BasePacket } from "./BasePacket";

export default class ExitFromBattlePacket extends BasePacket implements IExitFromBattle {
  layout: number = 0;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.layout = reader.readInt32BE();
  }

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `ExitFromBattlePacket(layout=${this.layout})`;
  }

  static getId(): number {
    return 377959142;
  }
}
