import { IPacket } from "./IPacket";

export interface IQuestPrize {
  itemName: string;
  itemCount: number;
}

export interface IQuest {
  canSkipForFree: boolean;
  description: string | null;
  finishCriteria: number;
  image: number;
  prizes: IQuestPrize[];
  progress: number;
  questId: number;
  skipCost: number;
}

export interface IShowQuestsWindow extends IPacket {
  quests: IQuest[];
  currentQuestLevel: number;
  currentQuestStreak: number;
  doneForToday: boolean;
  questImage: number;
  rewardImage: number;
}
