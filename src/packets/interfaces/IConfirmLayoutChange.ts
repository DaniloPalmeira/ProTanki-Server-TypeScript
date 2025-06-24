import { IPacket } from "./IPacket";

export interface IConfirmLayoutChange extends IPacket {
  fromLayout: number;
  toLayout: number;
}
