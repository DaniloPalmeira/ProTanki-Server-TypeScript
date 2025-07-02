import { IPacket } from "./IPacket";

export interface IAddUserToBattleDmData {
  battleId: string | null;
  nickname: string | null;
  kills: number;
  score: number;
  suspicious: boolean;
}

export interface IAddUserToBattleDm extends IPacket, IAddUserToBattleDmData {}
