import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IWeaponPhysics } from "../interfaces/IWeaponPhysics";
import { BasePacket } from "./BasePacket";

export default class WeaponPhysicsPacket extends BasePacket implements IWeaponPhysics {
  jsonData: string | null;

  constructor(jsonData: string | null = null) {
    super();
    this.jsonData = jsonData;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.jsonData = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.jsonData);
    return writer.getBuffer();
  }

  toString(): string {
    return `WeaponPhysicsPacket(jsonData=${this.jsonData})`;
  }

  static getId(): number {
    return -2124388778;
  }
}
