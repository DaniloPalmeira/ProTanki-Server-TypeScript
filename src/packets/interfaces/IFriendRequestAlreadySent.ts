import { IPacket } from "./IPacket";

export interface IFriendRequestAlreadySent extends IPacket {
  nickname: string | null;
}
