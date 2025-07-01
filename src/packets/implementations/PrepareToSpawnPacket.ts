import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IPrepareToSpawn } from "../interfaces/IPrepareToSpawn";
import { IVector3 } from "../interfaces/geom/IVector3";
import { BasePacket } from "./BasePacket";

export default class PrepareToSpawnPacket extends BasePacket implements IPrepareToSpawn {
  position: IVector3 | null;
  rotation: IVector3 | null;

  constructor(position: IVector3 | null = null, rotation: IVector3 | null = null) {
    super();
    this.position = position;
    this.rotation = rotation;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.position = reader.readOptionalVector3();
    this.rotation = reader.readOptionalVector3();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalVector3(this.position);
    writer.writeOptionalVector3(this.rotation);
    return writer.getBuffer();
  }

  toString(): string {
    const pos = this.position ? `(${this.position.x}, ${this.position.y}, ${this.position.z})` : "null";
    const rot = this.rotation ? `(${this.rotation.x}, ${this.rotation.y}, ${this.rotation.z})` : "null";
    return `PrepareToSpawnPacket(position=${pos}, rotation=${rot})`;
  }

  static getId(): number {
    return -157204477;
  }
}
