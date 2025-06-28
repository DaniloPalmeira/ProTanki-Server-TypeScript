import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IBattleDetails } from "../interfaces/IBattleDetails";
import { BasePacket } from "./BasePacket";

export default class BattleDetails extends BasePacket implements IBattleDetails {
  jsonData: string | null = null;

  constructor(jsonData?: string | null) {
    super();
    if (jsonData) {
      this.jsonData = jsonData;
    }
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
    return `BattleDetails(jsonData=${this.jsonData})`;
  }

  static getId(): number {
    return 546722394;
  }
}
