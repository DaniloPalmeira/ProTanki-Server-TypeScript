import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IValidateBattleName } from "../interfaces/IValidateBattleName";
import { BasePacket } from "./BasePacket";

export default class ValidateBattleNameResponse extends BasePacket implements IValidateBattleName {
  name: string | null;

  constructor(name: string | null) {
    super();
    this.name = name;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
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
