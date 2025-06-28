import { IPacket } from "./IPacket";

export interface IUpdatePremiumTime extends IPacket {
  timeLeft: number;
}
