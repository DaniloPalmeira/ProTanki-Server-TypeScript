import { IPacket } from "./IPacket";

export interface IStartShootingFreezeCommand extends IPacket {
    clientTime: number;
}

export interface IStartShootingFreezePacket extends IPacket {
    nickname: string | null;
}