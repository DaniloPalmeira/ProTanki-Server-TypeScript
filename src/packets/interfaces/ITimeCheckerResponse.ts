import { IPacket } from "./IPacket";

export interface ITimeCheckerResponse extends IPacket {
  clientTime: number;
  serverTime: number;
}
