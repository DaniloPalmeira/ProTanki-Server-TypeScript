import { IPacket } from "./IPacket";

export interface IAntifloodSettings extends IPacket {
  charDelayFactor: number;
  messageBaseDelay: number;
}
