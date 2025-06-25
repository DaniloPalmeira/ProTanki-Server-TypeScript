import { IPacket } from "./IPacket";

export interface IAcknowledgeNewFriend extends IPacket {
  nickname: string | null;
}
