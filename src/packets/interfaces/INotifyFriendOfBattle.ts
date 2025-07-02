import { BattleMode } from "../../models/Battle";
import { IPacket } from "./IPacket";

export interface INotifyFriendOfBattleData {
  battleId: string | null;
  mapName: string | null;
  mode: BattleMode;
  privateBattle: boolean;
  probattle: boolean;
  maxRank: number;
  minRank: number;
  serverNumber: number;
  nickname: string | null;
}

export interface INotifyFriendOfBattle extends IPacket, INotifyFriendOfBattleData {}
