import { IPacket } from "./IPacket";

export interface IUpdateRankData {
  rank: number;
  score: number;
  currentRankScore: number;
  nextRankScore: number;
  reward: number;
}

export interface IUpdateRank extends IPacket, IUpdateRankData {}
