import { IPacket } from "./IPacket";

export interface IResourceCallback extends IPacket {
  callbackId: number;
}
