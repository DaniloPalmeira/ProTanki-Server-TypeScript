import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IVector3 } from "../interfaces/geom/IVector3";
import { ISmokyStaticShotCommand } from "../interfaces/ISmokyShot";
import { BasePacket } from "./BasePacket";

export default class SmokyStaticShotCommandPacket extends BasePacket implements ISmokyStaticShotCommand {
  public clientTime: number = 0;
  public hitPosition: IVector3 | null = null;

  public read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.clientTime = reader.readInt32BE();
    this.hitPosition = reader.readOptionalVector3();
  }

  public write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.clientTime);
    writer.writeOptionalVector3(this.hitPosition);
    return writer.getBuffer();
  }

  public toString(): string {
    return `SmokyStaticShotCommandPacket(clientTime=${this.clientTime}, hitPosition=${JSON.stringify(this.hitPosition)})`;
  }

  public static getId(): number {
    return 1470597926;
  }
}
