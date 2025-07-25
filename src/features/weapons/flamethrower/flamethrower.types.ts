import { IPacket } from "@/packets/packet.interfaces";

export interface IStartShootingFlamethrowerCommand extends IPacket {
    clientTime: number;
}

export interface IStartShootingFlamethrowerPacket extends IPacket {
    nickname: string | null;
}

export interface IStopShootingFlamethrowerCommand extends IPacket {
    clientTime: number;
}

export interface IStopShootingFlamethrowerPacket extends IPacket {
    nickname: string | null;
}