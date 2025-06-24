import { IPacket } from "./IPacket";

export interface IOnlineNotifierData extends IPacket {
  isOnline: boolean;
  server: number;
  nickname: string;
}
