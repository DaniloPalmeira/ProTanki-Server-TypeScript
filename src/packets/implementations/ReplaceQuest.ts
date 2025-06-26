import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IReplaceQuest } from "../interfaces/IReplaceQuest";

export default class ReplaceQuest extends BasePacket implements IReplaceQuest {
  missionToReplaceId: number;
  newQuest: import("../interfaces/IShowQuestsWindow").IQuest;

  constructor(missionToReplaceId: number, newQuest: import("../interfaces/IShowQuestsWindow").IQuest) {
    super();
    this.missionToReplaceId = missionToReplaceId;
    this.newQuest = newQuest;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  write(): Buffer {
    const writer = new BufferWriter();

    writer.writeInt32BE(this.missionToReplaceId);

    const quest = this.newQuest;
    writer.writeUInt8(quest.canSkipForFree ? 1 : 0);
    writer.writeOptionalString(quest.description);
    writer.writeInt32BE(quest.finishCriteria);
    writer.writeInt32BE(quest.image);

    writer.writeInt32BE(quest.prizes.length);
    for (const prize of quest.prizes) {
      writer.writeInt32BE(prize.itemCount);
      writer.writeOptionalString(prize.itemName);
    }

    writer.writeInt32BE(quest.progress);
    writer.writeInt32BE(quest.questId);
    writer.writeInt32BE(quest.skipCost);

    return writer.getBuffer();
  }

  toString(): string {
    return `ReplaceQuest(oldId=${this.missionToReplaceId}, newId=${this.newQuest.questId})`;
  }

  static getId(): number {
    return -1266665816;
  }
}
