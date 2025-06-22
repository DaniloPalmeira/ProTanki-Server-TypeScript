import { IPacket } from "./IPacket";

export interface ISystemMessage extends IPacket {
  text: string;
}
