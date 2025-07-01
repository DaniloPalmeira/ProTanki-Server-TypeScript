import { IPacket } from "./IPacket";

export interface IRotateTurretCommand extends IPacket {
  clientTime: number;
  angle: number;
  control: number;
  incarnation: number;
}
