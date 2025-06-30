import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IBattleConsumables } from "../interfaces/IBattleConsumables";
import { BasePacket } from "./BasePacket";

export default class BattleConsumablesPacket extends BasePacket implements IBattleConsumables {
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
    return `BattleConsumablesPacket(jsonData=${this.jsonData})`;
  }

  static getId(): number {
    return -137249251;
  }
}
