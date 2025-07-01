import { IPacket } from "./IPacket";
import { IVector3 } from "./geom/IVector3";

export interface ISpawnData {
  nickname: string | null;
  team: number;
  position: IVector3 | null;
  orientation: IVector3 | null;
  health: number;
  incarnation: number;
}

export interface ISpawn extends IPacket, ISpawnData {}
