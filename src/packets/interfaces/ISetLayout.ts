import { IPacket } from "./IPacket";

export interface ISetLayout extends IPacket {
  layoutId: number;
}
