import { IPacket } from "./IPacket";

export interface IFriendRequestAccepted extends IPacket {
  nickname: string | null;
}
