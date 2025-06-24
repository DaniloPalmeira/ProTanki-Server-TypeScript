import { ISetBattleInviteSound } from "../interfaces/ISetBattleInviteSound";
import { BasePacket } from "./BasePacket";

export default class SetBattleInviteSound extends BasePacket implements ISetBattleInviteSound {
  soundIdLow: number;

  constructor(soundIdLow: number) {
    super();
    this.soundIdLow = soundIdLow;
  }

  read(buffer: Buffer): void {
    this.soundIdLow = buffer.readInt32BE(0);
  }

  write(): Buffer {
    const packet = Buffer.alloc(4);
    packet.writeInt32BE(this.soundIdLow, 0);
    return packet;
  }

  toString(): string {
    return `SetBattleInviteSound(soundIdLow=${this.soundIdLow})`;
  }

  getId(): number {
    return 834877801;
  }
}
