import { IPacket } from "@/packets/packet.interfaces";
import { IVector3 } from "@/shared/types/geom/ivector3";

export interface IRailgunShotTargetData {
    nickname: string;
    position: IVector3;
    incarnation: number;
    rotation: IVector3;
    orientation: IVector3;
}

export interface IRailgunShotCommand extends IPacket {
    clientTime: number;
    position: IVector3 | null;
    targets: IRailgunShotTargetData[];
}

export interface IRailgunShotPacketData {
    shooterNickname: string | null;
    hitPosition: IVector3 | null;
    targets: {
        nickname: string;
        position: IVector3;
    }[];
}

export interface IRailgunShotPacket extends IPacket, IRailgunShotPacketData { }

export interface IStartChargingCommand extends IPacket {
    clientTime: number;
}

export interface IStartChargingPacketData {
    nickname: string | null;
}

export interface IStartChargingPacket extends IPacket, IStartChargingPacketData { }