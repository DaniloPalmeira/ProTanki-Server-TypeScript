import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IBattleInfo } from "../interfaces/IBattleInfo";
import { BasePacket } from "./BasePacket";

export default class BattleInfo extends BasePacket implements IBattleInfo {
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
    return `BattleInfo(jsonData=${this.jsonData})`;
  }

  static getId(): number {
    return -838186985;
  }
}
