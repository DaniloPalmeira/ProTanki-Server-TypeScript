import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ISetBattleInviteSound } from "../interfaces/ISetBattleInviteSound";
import { BasePacket } from "./BasePacket";

export default class SetBattleInviteSound extends BasePacket implements ISetBattleInviteSound {
  soundIdLow: number;

  constructor(soundIdLow: number) {
    super();
    this.soundIdLow = soundIdLow;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.soundIdLow = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.soundIdLow);
    return writer.getBuffer();
  }

  toString(): string {
    return `SetBattleInviteSound(soundIdLow=${this.soundIdLow})`;
  }

  static getId(): number {
    return 834877801;
  }
}
