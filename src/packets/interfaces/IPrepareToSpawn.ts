import { IPacket } from "./IPacket";
import { IVector3 } from "./geom/IVector3";

export interface IPrepareToSpawn extends IPacket {
  position: IVector3 | null;
  rotation: IVector3 | null;
}
