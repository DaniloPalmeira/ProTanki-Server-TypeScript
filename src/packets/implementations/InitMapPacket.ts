import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IInitMap } from "../interfaces/IInitMap";
import { BasePacket } from "./BasePacket";

export default class InitMapPacket extends BasePacket implements IInitMap {
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
    console.log(writer.getBuffer().toString("hex"));
    return writer.getBuffer();
  }

  toString(): string {
    return `InitMapPacket(jsonData=${this.jsonData})`;
  }

  static getId(): number {
    return -152638117;
  }
}
