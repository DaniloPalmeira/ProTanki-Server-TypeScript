import { IPacket } from "./IPacket";

export interface ICheckUserExistsForFriend extends IPacket {
  nickname: string | null;
}
