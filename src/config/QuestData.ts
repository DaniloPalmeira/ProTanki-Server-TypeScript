import { ResourceId } from "../types/resourceTypes";

export type QuestType = "KILLS" | "SCORE" | "CRYSTALS";

export type CrystalReward = { type: "CRYSTAL"; minAmount: number; maxAmount: number };
export type SupplyReward = { type: "SUPPLY"; itemName: string; minAmount: number; maxAmount: number };
export type IQuestReward = CrystalReward | SupplyReward;

export interface IQuestDefinition {
  id: string;
  type: QuestType;
  description: string;
  imageResource: ResourceId;
  finishCriteria: number;
  rewardsByLevel: { [level: number]: IQuestReward[] };
  skipCost: number;
}

export const QuestDefinitions: IQuestDefinition[] = [
  {
    id: "daily_kills_1",
    type: "KILLS",
    description: "Destrua os inimigos",
    imageResource: "ui/quests/icons/kill_enemies",
    finishCriteria: 75,
    rewardsByLevel: {
      1: [{ type: "CRYSTAL", minAmount: 1500, maxAmount: 1600 }],
    },
    skipCost: 644,
  },
  {
    id: "daily_score_1",
    type: "SCORE",
    description: "Ganhe pontuação de batalha nas batalhas",
    imageResource: "ui/quests/icons/battle_score",
    finishCriteria: 500,
    rewardsByLevel: {
      1: [{ type: "SUPPLY", itemName: "Blindagem Dupla", minAmount: 15, maxAmount: 20 }],
    },
    skipCost: 644,
  },
  {
    id: "daily_crystals_1",
    type: "CRYSTALS",
    description: "Ganhe cristais em batalhas",
    imageResource: "ui/quests/icons/get_crystal",
    finishCriteria: 350,
    rewardsByLevel: {
      1: [
        { type: "SUPPLY", itemName: "Destruição Dupla", minAmount: 10, maxAmount: 15 },
        { type: "SUPPLY", itemName: "Blindagem Dupla", minAmount: 10, maxAmount: 15 },
      ],
    },
    skipCost: 644,
  },
];
