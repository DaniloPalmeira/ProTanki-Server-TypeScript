import { IPacket } from "./IPacket";
import { IVector3 } from "./geom/IVector3";

export interface IShotTargetData {
  nickname: string;
  position: IVector3;
  incarnation: number;
  rotation: IVector3;
  orientation: IVector3;
}

export interface IShotCommand extends IPacket {
  clientTime: number;
  position: IVector3 | null;
  targets: IShotTargetData[];
}

export interface IShotPacketData {
  shooterNickname: string | null;
  hitPosition: IVector3 | null;
  targets: {
    nickname: string;
    position: IVector3;
  }[];
}

export interface IShotPacket extends IPacket, IShotPacketData {}
