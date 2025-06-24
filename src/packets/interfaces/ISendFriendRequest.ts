import { IPacket } from "./IPacket";

export interface ISendFriendRequest extends IPacket {
  nickname: string | null;
}
