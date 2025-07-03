import { BattleMode, EquipmentConstraintsMode } from "../../models/Battle";
import { IPacket } from "./IPacket";

export interface IBattleStatsData {
  battleMode: BattleMode;
  equipmentConstraintsMode: EquipmentConstraintsMode;
  fund: number;
  scoreLimit: number;
  timeLimitInSec: number;
  mapName: string | null;
  maxPeopleCount: number;
  parkourMode: boolean;
  premiumBonusInPercent: number;
  spectator: boolean;
  suspiciousUserIds: string[];
  timeLeft: number;
}

export interface IBattleStats extends IBattleStatsData, IPacket {}
