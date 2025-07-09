import { IPacket } from "./IPacket";

export interface IStartChargingCommand extends IPacket {
  clientTime: number;
}

export interface IStartChargingPacketData {
  nickname: string | null;
}

export interface IStartChargingPacket extends IPacket, IStartChargingPacketData {}
