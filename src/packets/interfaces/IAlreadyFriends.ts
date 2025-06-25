import { IPacket } from "./IPacket";

export interface IAlreadyFriends extends IPacket {
  nickname: string | null;
}
