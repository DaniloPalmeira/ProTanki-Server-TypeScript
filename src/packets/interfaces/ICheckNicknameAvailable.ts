import { IPacket } from "./IPacket";

export interface ICheckNicknameAvailable extends IPacket {
  nickname: string | null;
}
