export interface IVector3 {
  x: number;
  y: number;
  z: number;
}

export interface IBattleMine {
  activated: boolean;
  mineId: string | null;
  ownerId: string | null;
  position: IVector3;
}
