import { IPacket } from "./IPacket";

export interface IActivateTank extends IPacket {
  nickname: string | null;
}
