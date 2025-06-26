import { IPacket } from "./IPacket";

export interface ILinkAccountResultSuccess extends IPacket {
  identifier: string | null;
}
