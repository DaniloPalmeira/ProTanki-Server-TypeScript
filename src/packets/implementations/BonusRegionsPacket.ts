import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IBonusRegionData, IBonusRegionResource } from "../interfaces/IBonusRegion";
import { IBonusRegions, IBonusRegionsData } from "../interfaces/IBonusRegions";
import { IVector3 } from "../interfaces/geom/IVector3";
import { BasePacket } from "./BasePacket";

export default class BonusRegionsPacket extends BasePacket implements IBonusRegions {
  bonusRegionResources: IBonusRegionResource[];
  bonusRegionData: IBonusRegionData[];

  constructor(data?: IBonusRegionsData) {
    super();
    this.bonusRegionResources = data?.bonusRegionResources ?? [];
    this.bonusRegionData = data?.bonusRegionData ?? [];
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);

    const resourceCount = reader.readInt32BE();
    this.bonusRegionResources = [];
    for (let i = 0; i < resourceCount; i++) {
      this.bonusRegionResources.push({
        bonusResource: reader.readInt32BE(),
        bonusType: reader.readInt32BE(),
      });
    }

    const dataCount = reader.readInt32BE();
    this.bonusRegionData = [];
    for (let i = 0; i < dataCount; i++) {
      const position: IVector3 = {
        x: reader.readFloatBE(),
        y: reader.readFloatBE(),
        z: reader.readFloatBE(),
      };
      const rotation: IVector3 = {
        x: reader.readFloatBE(),
        y: reader.readFloatBE(),
        z: reader.readFloatBE(),
      };
      const bonusType = reader.readInt32BE();
      this.bonusRegionData.push({ position, rotation, bonusType });
    }
  }

  write(): Buffer {
    const writer = new BufferWriter();

    writer.writeInt32BE(this.bonusRegionResources.length);
    for (const resource of this.bonusRegionResources) {
      writer.writeInt32BE(resource.bonusResource);
      writer.writeInt32BE(resource.bonusType);
    }

    writer.writeInt32BE(this.bonusRegionData.length);
    for (const data of this.bonusRegionData) {
      writer.writeFloatBE(data.position.x);
      writer.writeFloatBE(data.position.y);
      writer.writeFloatBE(data.position.z);
      writer.writeFloatBE(data.rotation.x);
      writer.writeFloatBE(data.rotation.y);
      writer.writeFloatBE(data.rotation.z);
      writer.writeInt32BE(data.bonusType);
    }

    return writer.getBuffer();
  }

  toString(): string {
    return `BonusRegionsPacket(resources=${JSON.stringify(this.bonusRegionResources)}, dataPoints=${JSON.stringify(this.bonusRegionData)})`;
  }

  static getId(): number {
    return -959048700;
  }
}
