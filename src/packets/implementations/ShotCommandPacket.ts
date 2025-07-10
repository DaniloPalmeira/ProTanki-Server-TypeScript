import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IVector3 } from "../interfaces/geom/IVector3";
import { IShotCommand, IShotTargetData } from "../interfaces/IShot";
import { BasePacket } from "./BasePacket";

export default class ShotCommandPacket extends BasePacket implements IShotCommand {
  public clientTime: number = 0;
  public position: IVector3 | null = null;
  public targets: IShotTargetData[] = [];

  public read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.clientTime = reader.readInt32BE();
    this.position = reader.readOptionalVector3();

    const targetNicknames = reader.readStringArray();
    const targetsPosition = this.readVector3Array(reader);
    const targetsIncarnation = reader.readInt16Array();
    const targetsRotation = this.readVector3Array(reader);
    const targetsOrientation = this.readVector3Array(reader);

    for (let i = 0; i < targetNicknames.length; i++) {
      this.targets.push({
        nickname: targetNicknames[i],
        position: targetsPosition[i],
        incarnation: targetsIncarnation[i],
        rotation: targetsRotation[i],
        orientation: targetsOrientation[i],
      });
    }
  }

  private readVector3Array(reader: BufferReader): IVector3[] {
    const vectors: IVector3[] = [];
    const isEmpty = reader.readUInt8() === 1;
    if (isEmpty) return vectors;

    const count = reader.readInt32BE();
    for (let i = 0; i < count; i++) {
      const vector = reader.readOptionalVector3();
      if (vector) {
        vectors.push(vector);
      }
    }
    return vectors;
  }

  public write(): Buffer {
    throw new Error("ShotCommandPacket is a client-to-server packet only and should not be written.");
  }

  public toString(): string {
    return `ShotCommandPacket(clientTime=${this.clientTime}, targets=${this.targets.length})`;
  }

  public static getId(): number {
    return -484994657;
  }
}
