import { IQuest, IQuestPrize } from "../packets/interfaces/IShowQuestsWindow";
import { UserDocument, IUserQuest } from "../models/User";
import { ResourceManager } from "../utils/ResourceManager";
import { QuestDefinitions } from "../config/QuestData";
import { ResourceId } from "../types/resourceTypes";

export interface DailyQuestData {
  quests: IQuest[];
  currentQuestLevel: number;
  currentQuestStreak: number;
  doneForToday: boolean;
  questImage: number;
  rewardImage: number;
}

export class QuestService {
  private isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  }

  private _generateNewQuest(user: UserDocument, existingQuestIds: string[]): IUserQuest {
    const availableQuests = QuestDefinitions.filter((def) => !existingQuestIds.includes(def.id));
    if (availableQuests.length === 0) {
      throw new Error("Não há mais missões disponíveis para troca.");
    }

    const randomIndex = Math.floor(Math.random() * availableQuests.length);
    const definition = availableQuests[randomIndex];

    const prizes: IQuestPrize[] = [];
    const rewards = definition.rewardsByLevel[user.questLevel] || definition.rewardsByLevel[1];
    for (const reward of rewards) {
      const amount = Math.floor(Math.random() * (reward.maxAmount - reward.minAmount + 1)) + reward.minAmount;
      prizes.push({
        itemName: reward.type === "CRYSTAL" ? "Cristais" : reward.itemName,
        itemCount: amount,
      });
    }

    return {
      questId: Math.floor(Math.random() * 1000000),
      definitionId: definition.id,
      progress: 0,
      prizes: prizes,
      isCompleted: false,
      canSkipForFree: false,
    };
  }

  private async _generateNewDailyQuests(user: UserDocument): Promise<void> {
    const existingQuestIds = user.dailyQuests.map((q) => q.definitionId);
    const quests: IUserQuest[] = [];

    for (let i = 0; i < 3; i++) {
      quests.push(this._generateNewQuest(user, existingQuestIds));
    }
    user.dailyQuests = quests;
    user.lastQuestGeneratedDate = new Date();
    await user.save();
  }

  public async rerollQuest(user: UserDocument, questIdToReplace: number, isPaid: boolean): Promise<{ oldQuestId: number; newQuest: IUserQuest }> {
    const questIndex = user.dailyQuests.findIndex((q) => q.questId === questIdToReplace);
    if (questIndex === -1) {
      throw new Error("Missão não encontrada.");
    }

    const questToReplace = user.dailyQuests[questIndex];
    const definition = QuestDefinitions.find((def) => def.id === questToReplace.definitionId);
    if (!definition) {
      throw new Error("Definição da missão não encontrada.");
    }

    if (isPaid) {
      if (user.crystals < definition.skipCost) {
        throw new Error("Cristais insuficientes.");
      }
      user.crystals -= definition.skipCost;
    } else {
      if (!questToReplace.canSkipForFree) {
        throw new Error("Esta missão não pode ser trocada gratuitamente.");
      }
    }

    const existingQuestIds = user.dailyQuests.map((q) => q.definitionId);
    const newQuest = this._generateNewQuest(user, existingQuestIds);

    user.dailyQuests[questIndex] = newQuest;
    await user.save();

    return { oldQuestId: questIdToReplace, newQuest };
  }

  public async getQuestsForUser(user: UserDocument): Promise<DailyQuestData> {
    const now = new Date();
    if (!user.lastQuestGeneratedDate || !this.isSameDay(user.lastQuestGeneratedDate, now)) {
      await this._generateNewDailyQuests(user);
    }

    const questsForPacket: IQuest[] = user.dailyQuests
      .filter((q) => !q.isCompleted)
      .map((q) => {
        const definition = QuestDefinitions.find((def) => def.id === q.definitionId);
        if (!definition) {
          return null;
        }

        const quest: IQuest = {
          canSkipForFree: q.canSkipForFree,
          description: definition.description,
          finishCriteria: definition.finishCriteria,
          image: ResourceManager.getIdlowById(definition.imageResource),
          progress: q.progress,
          questId: q.questId,
          skipCost: definition.skipCost,
          prizes: q.prizes,
        };
        return quest;
      })
      .filter((q): q is IQuest => q !== null);

    const doneForToday = user.lastQuestCompletedDate ? this.isSameDay(user.lastQuestCompletedDate, now) : false;

    const weekLevel = Math.max(1, Math.min(user.questLevel, 4));
    const questChainPath = `ui/quests/window/week${weekLevel}/quest_chain` as ResourceId;
    const finalRewardPath = `ui/quests/window/week${weekLevel}/final_reward` as ResourceId;

    return {
      quests: questsForPacket,
      currentQuestLevel: user.questLevel,
      currentQuestStreak: user.questStreak,
      doneForToday,
      questImage: ResourceManager.getIdlowById(questChainPath),
      rewardImage: ResourceManager.getIdlowById(finalRewardPath),
    };
  }
}
