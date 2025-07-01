import { IPacket } from "./IPacket";

export interface IDestroyTankPacket extends IPacket {
  nickname: string | null;
  readyToSpawnInMs: number;
}
