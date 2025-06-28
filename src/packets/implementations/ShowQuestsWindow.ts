import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IShowQuestsWindow, IQuest } from "../interfaces/IShowQuestsWindow";
import { DailyQuestData } from "../../services/QuestService";

export default class ShowQuestsWindow extends BasePacket implements IShowQuestsWindow {
  quests: IQuest[] = [];
  currentQuestLevel: number = 0;
  currentQuestStreak: number = 0;
  doneForToday: boolean = false;
  questImage: number = 0;
  rewardImage: number = 0;

  constructor(data?: DailyQuestData) {
    super();
    if (data) {
      this.quests = data.quests;
      this.currentQuestLevel = data.currentQuestLevel;
      this.currentQuestStreak = data.currentQuestStreak;
      this.doneForToday = data.doneForToday;
      this.questImage = data.questImage;
      this.rewardImage = data.rewardImage;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    const questsCount = reader.readInt32BE();
    this.quests = [];
    for (let i = 0; i < questsCount; i++) {
      const quest: IQuest = {
        canSkipForFree: reader.readUInt8() === 1,
        description: reader.readOptionalString(),
        finishCriteria: reader.readInt32BE(),
        image: reader.readInt32BE(),
        prizes: [],
        progress: 0,
        questId: 0,
        skipCost: 0,
      };

      const prizesCount = reader.readInt32BE();
      for (let j = 0; j < prizesCount; j++) {
        quest.prizes.push({
          itemCount: reader.readInt32BE(),
          itemName: reader.readOptionalString() ?? "",
        });
      }

      quest.progress = reader.readInt32BE();
      quest.questId = reader.readInt32BE();
      quest.skipCost = reader.readInt32BE();
      this.quests.push(quest);
    }

    this.currentQuestLevel = reader.readInt32BE();
    this.currentQuestStreak = reader.readInt32BE();
    this.doneForToday = reader.readUInt8() === 1;
    this.questImage = reader.readInt32BE();
    this.rewardImage = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();

    writer.writeInt32BE(this.quests.length);
    for (const quest of this.quests) {
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
    }

    writer.writeInt32BE(this.currentQuestLevel);
    writer.writeInt32BE(this.currentQuestStreak);
    writer.writeUInt8(this.doneForToday ? 1 : 0);
    writer.writeInt32BE(this.questImage);
    writer.writeInt32BE(this.rewardImage);

    return writer.getBuffer();
  }

  toString(): string {
    return `ShowQuestsWindow(\n` + `  questsCount=${this.quests.length},\n` + `  currentQuestLevel=${this.currentQuestLevel},\n` + `  currentQuestStreak=${this.currentQuestStreak},\n` + `  doneForToday=${this.doneForToday},\n` + `  questImage=${this.questImage},\n` + `  rewardImage=${this.rewardImage}\n` + `)`;
  }

  static getId(): number {
    return 809822533;
  }
}
