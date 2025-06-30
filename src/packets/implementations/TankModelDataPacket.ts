import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ITankModelData } from "../interfaces/ITankModelData";
import { BasePacket } from "./BasePacket";

export default class TankModelDataPacket extends BasePacket implements ITankModelData {
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
    return `TankModelDataPacket()`;
  }

  static getId(): number {
    return -1643824092;
  }
}
