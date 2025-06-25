import { IPacket } from "./IPacket";

export interface IDeclineFriendRequest extends IPacket {
  nickname: string | null;
}
