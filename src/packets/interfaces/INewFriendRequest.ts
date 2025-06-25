import { IPacket } from "./IPacket";

export interface INewFriendRequest extends IPacket {
  nickname: string | null;
}
