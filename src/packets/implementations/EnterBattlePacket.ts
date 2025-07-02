import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IEnterBattle } from "../interfaces/IEnterBattle";
import { BasePacket } from "./BasePacket";

export default class EnterBattlePacket extends BasePacket implements IEnterBattle {
  battleTeam: number = 0;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.battleTeam = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.battleTeam);
    return writer.getBuffer();
  }

  toString(): string {
    return `EnterBattlePacket(battleTeam=${this.battleTeam})`;
  }

  static getId(): number {
    return -1284211503;
  }
}
