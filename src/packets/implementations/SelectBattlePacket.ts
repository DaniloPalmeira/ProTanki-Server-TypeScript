import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ISelectBattle } from "../interfaces/ISelectBattle";
import { BasePacket } from "./BasePacket";

export default class SelectBattlePacket extends BasePacket implements ISelectBattle {
  battleId: string | null = null;

  constructor(battleId?: string | null) {
    super();
    if (battleId) {
      this.battleId = battleId;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    const readId = reader.readOptionalString();
    this.battleId = readId ? readId.trim() : null;
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.battleId);
    return writer.getBuffer();
  }

  toString(): string {
    return `SelectBattlePacket(battleId=${this.battleId})`;
  }

  static getId(): number {
    return 2092412133;
  }
}
