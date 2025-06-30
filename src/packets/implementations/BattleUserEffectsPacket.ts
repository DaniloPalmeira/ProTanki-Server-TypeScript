import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IBattleUserEffects } from "../interfaces/IBattleUserEffects";
import { BasePacket } from "./BasePacket";

export default class BattleUserEffectsPacket extends BasePacket implements IBattleUserEffects {
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
    return `BattleUserEffectsPacket(jsonData=${this.jsonData})`;
  }

  static getId(): number {
    return 417965410;
  }
}
