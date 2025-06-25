import { IPacket } from "./IPacket";

export interface IFriendRequestDeclined extends IPacket {
  nickname: string | null;
}
