import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IValidateBattleName } from "../interfaces/IValidateBattleName";
import { BasePacket } from "./BasePacket";

export default class ValidateBattleNameRequest extends BasePacket implements IValidateBattleName {
  name: string | null = null;

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
    return `ValidateBattleNameRequest(name=${this.name})`;
  }

  static getId(): number {
    return 566652736;
  }
}
