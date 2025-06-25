import { IPacket } from "./IPacket";

export interface ICancelFriendRequest extends IPacket {
  nickname: string | null;
}
