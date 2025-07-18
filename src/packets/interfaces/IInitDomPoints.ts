import { IPacket } from "./IPacket";
import { IVector3 } from "./geom/IVector3";

export interface IDomPoint {
    id: number;
    name: string | null;
    position: IVector3 | null;
    score: number;
    scoreChangeRate: number;
    state: number;
    tankIds: string[];
}

export interface IInitDomPointsData {
    keypointTriggerRadius: number;
    keypointVisorHeight: number;
    minesRestrictionRadius: number;
    points: IDomPoint[];
    bigLetters: number;
    blueCircle: number;
    bluePedestalTexture: number;
    blueRay: number;
    blueRayTip: number;
    neutralCircle: number;
    neutralPedestalTexture: number;
    pedestal: number;
    redCircle: number;
    redPedestalTexture: number;
    redRay: number;
    redRayTip: number;
    pointCaptureStartNegativeSound: number;
    pointCaptureStartPositiveSound: number;
    pointCaptureStopNegativeSound: number;
    pointCaptureStopPositiveSound: number;
    pointCapturedNegativeSound: number;
    pointCapturedPositiveSound: number;
    pointNeutralizedNegativeSound: number;
    pointNeutralizedPositiveSound: number;
    pointScoreDecreasingSound: number;
    pointScoreIncreasingSound: number;
}

export interface IInitDomPoints extends IPacket, IInitDomPointsData { }