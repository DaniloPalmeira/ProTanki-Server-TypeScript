import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IShowQuestsWindow, IQuest } from "../interfaces/IShowQuestsWindow";
import { DailyQuestData } from "../../services/QuestService";
import { IPacket } from "../interfaces/IPacket";

export default class ShowQuestsWindow extends BasePacket implements IShowQuestsWindow {
  quests: IQuest[];
  currentQuestLevel: number;
  currentQuestStreak: number;
  doneForToday: boolean;
  questImage: number;
  rewardImage: number;

  constructor(data: DailyQuestData) {
    super();
    this.quests = data.quests;
    this.currentQuestLevel = data.currentQuestLevel;
    this.currentQuestStreak = data.currentQuestStreak;
    this.doneForToday = data.doneForToday;
    this.questImage = data.questImage;
    this.rewardImage = data.rewardImage;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
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
    return `ShowQuestsWindow(quests=${this.quests.length})`;
  }

  static getId(): number {
    return 809822533;
  }
}
