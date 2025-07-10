import { IPacket } from "./IPacket";
import { IVector3 } from "./geom/IVector3";

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

export interface IRailgunShotPacket extends IPacket, IRailgunShotPacketData {}
