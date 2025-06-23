import { IPacket } from "./IPacket";

export interface IPunishment extends IPacket {
  reason: string | null;
  days: number;
  hours: number;
  minutes: number;
}
