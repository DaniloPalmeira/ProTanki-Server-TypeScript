import { IPacket } from "./IPacket";

export interface IIncomingFriendRequestExists extends IPacket {
  nickname: string | null;
}
