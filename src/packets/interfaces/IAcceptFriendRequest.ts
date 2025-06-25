import { IPacket } from "./IPacket";

export interface IAcceptFriendRequest extends IPacket {
  nickname: string | null;
}
