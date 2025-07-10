import { IPacket } from "./IPacket";

export interface ISelfDestructScheduled extends IPacket {
  time: number;
}
