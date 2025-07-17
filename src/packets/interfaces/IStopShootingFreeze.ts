import { IPacket } from "./IPacket";

export interface IStopShootingFreezeCommand extends IPacket {
    clientTime: number;
}

export interface IStopShootingFreezePacket extends IPacket {
    nickname: string | null;
}