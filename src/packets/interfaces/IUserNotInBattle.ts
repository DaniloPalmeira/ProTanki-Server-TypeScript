import { IPacket } from "./IPacket";

export interface IUserNotInBattle extends IPacket {
  nickname: string | null;
}
