import { IQuest, IQuestPrize } from "../packets/interfaces/IShowQuestsWindow";
import { UserDocument } from "../models/User";
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

  private async _generateNewDailyQuests(user: UserDocument): Promise<void> {
    user.dailyQuests = [];

    const availableQuests = [...QuestDefinitions];

    for (let i = 0; i < 3; i++) {
      if (availableQuests.length === 0) break;

      const randomIndex = Math.floor(Math.random() * availableQuests.length);
      const definition = availableQuests.splice(randomIndex, 1)[0];

      const prizes: IQuestPrize[] = [];
      const rewards = definition.rewardsByLevel[user.questLevel] || definition.rewardsByLevel[1];
      for (const reward of rewards) {
        const amount = Math.floor(Math.random() * (reward.maxAmount - reward.minAmount + 1)) + reward.minAmount;
        prizes.push({
          itemName: reward.type === "CRYSTAL" ? "Cristais" : reward.itemName,
          itemCount: amount,
        });
      }

      user.dailyQuests.push({
        questId: Math.floor(Math.random() * 1000000),
        definitionId: definition.id,
        progress: 0,
        prizes: prizes,
        isCompleted: false,
      });
    }
    user.lastQuestGeneratedDate = new Date();
    await user.save();
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
          canSkipForFree: true, // Lógica a ser implementada
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
