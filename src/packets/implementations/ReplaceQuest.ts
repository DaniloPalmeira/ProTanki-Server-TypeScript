import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IReplaceQuest } from "../interfaces/IReplaceQuest";
import { IQuest } from "../interfaces/IShowQuestsWindow";

function createDefaultQuest(): IQuest {
  return {
    canSkipForFree: false,
    description: "",
    finishCriteria: 0,
    image: 0,
    prizes: [],
    progress: 0,
    questId: 0,
    skipCost: 0,
  };
}

export default class ReplaceQuest extends BasePacket implements IReplaceQuest {
  missionToReplaceId: number = 0;
  newQuest: IQuest = createDefaultQuest();

  constructor(missionToReplaceId?: number, newQuest?: IQuest) {
    super();
    if (missionToReplaceId !== undefined) {
      this.missionToReplaceId = missionToReplaceId;
    }
    if (newQuest) {
      this.newQuest = newQuest;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.missionToReplaceId = reader.readInt32BE();

    const newQuestData = createDefaultQuest();
    newQuestData.canSkipForFree = reader.readUInt8() === 1;
    newQuestData.description = reader.readOptionalString();
    newQuestData.finishCriteria = reader.readInt32BE();
    newQuestData.image = reader.readInt32BE();

    const prizesCount = reader.readInt32BE();
    newQuestData.prizes = [];
    for (let i = 0; i < prizesCount; i++) {
      newQuestData.prizes.push({
        itemCount: reader.readInt32BE(),
        itemName: reader.readOptionalString() ?? "",
      });
    }

    newQuestData.progress = reader.readInt32BE();
    newQuestData.questId = reader.readInt32BE();
    newQuestData.skipCost = reader.readInt32BE();

    this.newQuest = newQuestData;
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
    return `ReplaceQuest(oldId=${this.missionToReplaceId}, newQuestId=${this.newQuest.questId})`;
  }

  static getId(): number {
    return -1266665816;
  }
}
