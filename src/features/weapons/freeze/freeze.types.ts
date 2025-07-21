import { IPacket } from "@/packets/IPacket";

export interface IStartShootingFreezeCommand extends IPacket {
    clientTime: number;
}

export interface IStartShootingFreezePacket extends IPacket {
    nickname: string | null;
}

export interface IStopShootingFreezeCommand extends IPacket {
    clientTime: number;
}

export interface IStopShootingFreezePacket extends IPacket {
    nickname: string | null;
}