import { IVector3 } from "./geom/IVector3";

export interface IBattleMine {
  activated: boolean;
  mineId: string | null;
  ownerId: string | null;
  position: IVector3;
}
