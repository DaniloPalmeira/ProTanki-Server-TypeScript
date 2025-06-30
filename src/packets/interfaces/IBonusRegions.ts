import { IPacket } from "./IPacket";
import { IBonusRegionResource, IBonusRegionData } from "./IBonusRegion";

export interface IBonusRegionsData {
  bonusRegionResources: IBonusRegionResource[];
  bonusRegionData: IBonusRegionData[];
}

export interface IBonusRegions extends IPacket, IBonusRegionsData {}
