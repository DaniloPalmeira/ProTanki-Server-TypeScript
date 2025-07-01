import { IPacket } from "./IPacket";

export interface IUpdateBattleUserTeamData {
  deaths: number;
  kills: number;
  score: number;
  nickname: string | null;
  team: number;
}

export interface IUpdateBattleUserTeam extends IPacket, IUpdateBattleUserTeamData {}
