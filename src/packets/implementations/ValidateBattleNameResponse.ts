import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IValidateBattleName } from "../interfaces/IValidateBattleName";
import { BasePacket } from "./BasePacket";

export default class ValidateBattleNameResponse extends BasePacket implements IValidateBattleName {
  name: string | null = null;

  constructor(name?: string | null) {
    super();
    if (name) {
      this.name = name;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.name = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.name);
    return writer.getBuffer();
  }

  toString(): string {
    return `ValidateBattleNameResponse(name=${this.name})`;
  }

  static getId(): number {
    return 120401338;
  }
}
