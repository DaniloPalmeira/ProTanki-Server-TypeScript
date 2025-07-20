import { IPacket } from "@/packets/interfaces/IPacket";
import { IVector3 } from "@/packets/interfaces/geom/IVector3";

export interface ISmokyStaticShotCommand extends IPacket {
    clientTime: number;
    hitPosition: IVector3 | null;
}

export interface ISmokyStaticShotPacket extends IPacket {
    nickname: string | null;
    hitPosition: IVector3 | null;
}

export interface ISmokyTargetShotCommand extends IPacket {
    clientTime: number;
    targetUserId: string | null;
    targetIncarnation: number;
    targetPosition: IVector3 | null;
    hitLocalPosition: IVector3 | null;
    hitGlobalPosition: IVector3 | null;
}

export interface ISmokyTargetShotPacket extends IPacket {
    nickname: string | null;
    targetNickname: string | null;
    hitPosition: IVector3 | null;
    impactForce: number;
    critical: boolean;
}