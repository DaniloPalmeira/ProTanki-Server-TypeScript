import { IPacket } from "./IPacket";
import { IVector3 } from "./geom/IVector3";

export interface IInitCtfFlagsData {
    flagBasePositionBlue: IVector3 | null;
    flagCarrierIdBlue: string | null;
    flagPositionBlue: IVector3 | null;
    blueFlagSprite: number;
    bluePedestalModel: number;
    flagBasePositionRed: IVector3 | null;
    flagCarrierIdRed: string | null;
    flagPositionRed: IVector3 | null;
    redFlagSprite: number;
    redPedestalModel: number;
    flagDropSound: number;
    flagReturnSound: number;
    flagTakeSound: number;
    winSound: number;
}

export interface IInitCtfFlags extends IPacket, IInitCtfFlagsData { }