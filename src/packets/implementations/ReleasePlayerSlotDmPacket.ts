import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IReleasePlayerSlotDm, IReleasePlayerSlotDmData } from "../interfaces/IReleasePlayerSlotDm";
import { BasePacket } from "./BasePacket";

export default class ReleasePlayerSlotDmPacket extends BasePacket implements IReleasePlayerSlotDm {
  battleId: string | null;
  nickname: string | null;

  constructor(data?: IReleasePlayerSlotDmData) {
    super();
    this.battleId = data?.battleId ?? null;
    this.nickname = data?.nickname ?? null;
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
    return `ReleasePlayerSlotDmPacket(battleId=${this.battleId}, nickname=${this.nickname})`;
  }

  static getId(): number {
    return 504016996;
  }
}
