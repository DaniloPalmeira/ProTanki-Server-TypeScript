import { IPacket } from "./IPacket";

export interface IStartShootingFlamethrowerCommand extends IPacket {
    clientTime: number;
}

export interface IStartShootingFlamethrowerPacket extends IPacket {
    nickname: string | null;
}