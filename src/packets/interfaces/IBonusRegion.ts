import { IVector3 } from "./geom/IVector3";

export enum BonusType {
  NITRO,
  DAMAGE,
  ARMOR,
  HEALTH,
  CRYSTAL,
  GOLD,
  SPECIAL,
  MOON,
  PUMPKIN,
}

export interface IBonusRegionResource {
  bonusResource: number;
  bonusType: BonusType;
}

export interface IBonusRegionData {
  position: IVector3;
  rotation: IVector3;
  bonusType: BonusType;
}
