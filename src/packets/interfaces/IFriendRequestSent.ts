import { IPacket } from "./IPacket";

export interface IFriendRequestSent extends IPacket {
  nickname: string | null;
}
