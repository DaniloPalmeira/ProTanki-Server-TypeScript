import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IReservePlayerSlotDm } from "../interfaces/IReservePlayerSlotDm";
import { BasePacket } from "./BasePacket";

export default class ReservePlayerSlotDmPacket extends BasePacket implements IReservePlayerSlotDm {
  battleId: string | null;
  nickname: string | null;

  constructor(battleId: string | null = null, nickname: string | null = null) {
    super();
    this.battleId = battleId;
    this.nickname = nickname;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.battleId = reader.readOptionalString();
    this.nickname = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.battleId);
    writer.writeOptionalString(this.nickname);
    return writer.getBuffer();
  }

  toString(): string {
    return `ReservePlayerSlotDmPacket(battleId=${this.battleId}, nickname=${this.nickname})`;
  }

  static getId(): number {
    return -2133657895;
  }
}
