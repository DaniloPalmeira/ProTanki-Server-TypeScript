import { IPacket } from "./IPacket";

export interface IRankNotifierData extends IPacket {
  rank: number;
  nickname: string;
}
