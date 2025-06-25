import { IPacket } from "./IPacket";

export interface IAcknowledgeNewFriendRequest extends IPacket {
  nickname: string | null;
}
