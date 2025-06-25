import { IPacket } from "./IPacket";

export interface IFriendRequestCanceledOrDeclined extends IPacket {
  nickname: string | null;
}
