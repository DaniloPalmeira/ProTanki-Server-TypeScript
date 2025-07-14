import { IPacket } from "./IPacket";

export interface IUpdateSpectatorList extends IPacket {
  spectatorList: string | null;
}
