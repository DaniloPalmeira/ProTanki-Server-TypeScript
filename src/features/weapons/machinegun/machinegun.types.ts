import { IPacket } from "@/packets/interfaces/IPacket";
import { IVector3 } from "@/packets/interfaces/geom/IVector3";

export interface IStartShootingMachinegunCommand extends IPacket {
    clientTime: number;
}

export interface IStartShootingMachinegunPacket extends IPacket {
    nickname: string | null;
}

export interface IMachinegunShotTargetCommandData {
    localHitPoint: IVector3 | null;
    orientation: IVector3 | null;
    position: IVector3 | null;
    nickname: string | null;
    turretAngle: number;
}

export interface IMachinegunShotCommand extends IPacket {
    clientTime: number;
    shotDirection: IVector3 | null;
    targets: IMachinegunShotTargetCommandData[];
}

export interface IMachinegunShotTargetPacketData {
    direction: IVector3 | null;
    localHitPoint: IVector3 | null;
    numberHits: number;
    nickname: string | null;
}

export interface IMachinegunShotPacketData {
    nickname: string | null;
    shotDirection: IVector3 | null;
    targets: IMachinegunShotTargetPacketData[];
}
export interface IMachinegunShotPacket extends IPacket, IMachinegunShotPacketData { }

export interface IStopShootingMachinegunCommand extends IPacket {
    clientTime: number;
}

export interface IStopShootingMachinegunPacket extends IPacket {
    nickname: string | null;
}