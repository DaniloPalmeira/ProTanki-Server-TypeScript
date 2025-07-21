import { IPacket } from "@/packets/packet.interfaces";
import { IVector3 } from "@/shared/types/geom/ivector3";

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