import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IConfirmBattleInfo } from "../interfaces/IConfirmBattleInfo";
import { BasePacket } from "./BasePacket";

export default class ConfirmBattleInfo extends BasePacket implements IConfirmBattleInfo {
  battleId: string | null;

  constructor(battleId: string | null) {
    super();
    this.battleId = battleId;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
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
