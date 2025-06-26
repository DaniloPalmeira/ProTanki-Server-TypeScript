import { IPacket } from "./IPacket";

export interface IUpdateCrystals extends IPacket {
  crystals: number;
}
