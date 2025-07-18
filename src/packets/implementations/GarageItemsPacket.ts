import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IGarageItems } from "../interfaces/IGarageItems";
import { BasePacket } from "./BasePacket";

export default class GarageItemsPacket extends BasePacket implements IGarageItems {
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
    return `GarageItemsPacket(jsonData=${this.jsonData})`;
  }

  static getId(): number {
    return -255516505;
  }
}
