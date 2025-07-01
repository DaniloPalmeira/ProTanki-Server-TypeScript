import { IPacket } from "./IPacket";

export interface ISetHealthData {
  nickname: string | null;
  health: number;
}

export interface ISetHealth extends IPacket, ISetHealthData {}
