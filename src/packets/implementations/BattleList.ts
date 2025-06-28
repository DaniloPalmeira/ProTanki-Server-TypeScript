import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IBattleList } from "../interfaces/IBattleList";
import { BasePacket } from "./BasePacket";

export default class BattleList extends BasePacket implements IBattleList {
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
    return `BattleList(jsonData=${this.jsonData})`;
  }

  static getId(): number {
    return 552006706;
  }
}
