import { IPacket } from "./IPacket";
import { IVector3 } from "./geom/IVector3";

export interface IMovePhysics {
  angularVelocity: IVector3 | null;
  control: number;
  linearVelocity: IVector3 | null;
  orientation: IVector3 | null;
  position: IVector3 | null;
}

export interface IFullMoveCommand extends IPacket, IMovePhysics {
  clientTime: number;
  incarnation: number;
}

export interface IMovePacketData extends IMovePhysics {
  nickname: string | null;
  incarnation: number;
}

export interface IMovePacket extends IPacket, IMovePacketData {}
