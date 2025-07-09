import { IPacket } from "./IPacket";

export interface IUpdateScore extends IPacket {
  score: number;
}
