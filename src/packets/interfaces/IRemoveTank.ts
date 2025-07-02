import { IPacket } from "./IPacket";

export interface IRemoveTank extends IPacket {
  nickname: string | null;
}
