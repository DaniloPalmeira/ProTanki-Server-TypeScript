import { BufferReader } from "../../utils/buffer/BufferReader";
import { IRequestBattleInfo } from "../interfaces/IRequestBattleInfo";
import { BasePacket } from "./BasePacket";

export default class RequestBattleInfo extends BasePacket implements IRequestBattleInfo {
  battleId: string | null = null;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.battleId = reader.readOptionalString();
  }

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `RequestBattleInfo(battleId=${this.battleId})`;
  }

  static getId(): number {
    return 2092412133;
  }
}
