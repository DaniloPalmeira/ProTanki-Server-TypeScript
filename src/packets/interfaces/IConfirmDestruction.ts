import { IPacket } from "./IPacket";

export interface IConfirmDestruction extends IPacket {
  nickname: string | null;
  delaytoSpawn: number;
}
