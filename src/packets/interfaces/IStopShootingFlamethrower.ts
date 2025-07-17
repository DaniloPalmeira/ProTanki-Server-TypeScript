import { IPacket } from "./IPacket";

export interface IStopShootingFlamethrowerCommand extends IPacket {
    clientTime: number;
}

export interface IStopShootingFlamethrowerPacket extends IPacket {
    nickname: string | null;
}