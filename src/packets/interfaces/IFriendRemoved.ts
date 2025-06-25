import { IPacket } from "./IPacket";

export interface IFriendRemoved extends IPacket {
  nickname: string | null;
}
