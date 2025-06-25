import { IPacket } from "./IPacket";

export interface IRemoveFriend extends IPacket {
  nickname: string | null;
}
