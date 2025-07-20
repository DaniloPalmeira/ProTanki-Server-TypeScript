import { IPacket } from "@/packets/interfaces/IPacket";
import { IEmpty } from "@/packets/interfaces/IEmpty";

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

export interface ISkipQuest extends IPacket {
    missionId: number;
}

export interface IRequestQuestsWindow extends IEmpty { }

export interface INotifyDailyQuestGenerated extends IEmpty { }

export interface IReplaceQuest extends IPacket {
    missionToReplaceId: number;
    newQuest: IQuest;
}