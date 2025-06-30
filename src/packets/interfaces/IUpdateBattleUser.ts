import { IPacket } from "./IPacket";

export interface IUpdateBattleUserData {
  deaths: number;
  kills: number;
  score: number;
  nickname: string | null;
  team: number;
}

export interface IUpdateBattleUser extends IPacket, IUpdateBattleUserData {}
