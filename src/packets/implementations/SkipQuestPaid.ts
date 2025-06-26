import { BufferReader } from "../../utils/buffer/BufferReader";
import { BasePacket } from "./BasePacket";
import { ISkipQuest } from "../interfaces/ISkipQuest";

export default class SkipQuestPaid extends BasePacket implements ISkipQuest {
  missionId: number = 0;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.missionId = reader.readInt32BE();
  }

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `SkipQuestPaid(missionId=${this.missionId})`;
  }

  static getId(): number {
    return 1642608662;
  }
}
