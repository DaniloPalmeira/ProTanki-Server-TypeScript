import { IPacket } from "./IPacket";

export interface IPremiumNotifierData extends IPacket {
  premiumTimeLeftInSeconds: number;
  nickname: string;
}
