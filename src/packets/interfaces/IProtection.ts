import { IPacket } from "./IPacket";

export interface IProtection extends IPacket {
  keys: Array<number>;
}
