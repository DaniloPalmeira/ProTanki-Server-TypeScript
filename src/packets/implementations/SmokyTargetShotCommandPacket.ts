import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IVector3 } from "../interfaces/geom/IVector3";
import { ISmokyTargetShotCommand } from "../interfaces/ISmokyShot";
import { BasePacket } from "./BasePacket";

export default class SmokyTargetShotCommandPacket extends BasePacket implements ISmokyTargetShotCommand {
  public clientTime: number = 0;
  public targetUserId: string | null = null;
  public targetIncarnation: number = 0;
  public targetPosition: IVector3 | null = null;
  public hitLocalPosition: IVector3 | null = null;
  public hitGlobalPosition: IVector3 | null = null;

  public read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.clientTime = reader.readInt32BE();
    this.targetUserId = reader.readOptionalString();
    this.targetIncarnation = reader.readInt16BE();
    this.targetPosition = reader.readOptionalVector3();
    this.hitLocalPosition = reader.readOptionalVector3();
    this.hitGlobalPosition = reader.readOptionalVector3();
  }

  public write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.clientTime);
    writer.writeOptionalString(this.targetUserId);
    writer.writeInt16BE(this.targetIncarnation);
    writer.writeOptionalVector3(this.targetPosition);
    writer.writeOptionalVector3(this.hitLocalPosition);
    writer.writeOptionalVector3(this.hitGlobalPosition);
    return writer.getBuffer();
  }

  public toString(): string {
    return `SmokyTargetShotCommandPacket(\n` + `  clientTime=${this.clientTime},\n` + `  targetUserId=${this.targetUserId},\n` + `  targetIncarnation=${this.targetIncarnation},\n` + `  targetPosition=${JSON.stringify(this.targetPosition)},\n` + `  hitLocalPosition=${JSON.stringify(this.hitLocalPosition)},\n` + `  hitGlobalPosition=${JSON.stringify(this.hitGlobalPosition)}\n` + `)`;
  }

  public static getId(): number {
    return 229267683;
  }
}
