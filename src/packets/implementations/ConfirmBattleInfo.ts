import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IConfirmBattleInfo } from "../interfaces/IConfirmBattleInfo";
import { BasePacket } from "./BasePacket";

export default class ConfirmBattleInfo extends BasePacket implements IConfirmBattleInfo {
  battleId: string | null = null;

  constructor(battleId?: string | null) {
    super();
    if (battleId) {
      this.battleId = battleId;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.battleId = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.battleId);
    return writer.getBuffer();
  }

  toString(): string {
    return `ConfirmBattleInfo(battleId=${this.battleId})`;
  }

  static getId(): number {
    return 2092412133;
  }
}
