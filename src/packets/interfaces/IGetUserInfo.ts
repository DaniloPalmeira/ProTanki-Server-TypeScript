import { IPacket } from "./IPacket";

export interface IGetUserInfo extends IPacket {
  nickname: string;
}
