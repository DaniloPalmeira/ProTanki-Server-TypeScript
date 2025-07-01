import { IPacket } from "./IPacket";

export interface IUpdateBattleUserDMData {
  deaths: number;
  kills: number;
  score: number;
  nickname: string | null;
}

export interface IUpdateBattleUserDM extends IPacket, IUpdateBattleUserDMData {}
