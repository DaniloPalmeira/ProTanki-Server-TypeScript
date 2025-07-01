import { IPacket } from "./IPacket";

export interface IRotateTurretCommand extends IPacket {
  clientTime: number;
  angle: number;
  control: number;
  incarnation: number;
}

export interface IRotateTurretPacketData {
  nickname: string | null;
  angle: number;
  control: number;
}

export interface IRotateTurretPacket extends IPacket, IRotateTurretPacketData {}
