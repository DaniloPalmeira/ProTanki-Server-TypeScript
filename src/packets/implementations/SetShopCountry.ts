import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { ISetShopCountry } from "../interfaces/ISetShopCountry";

export default class SetShopCountry extends BasePacket implements ISetShopCountry {
  countryCode: string | null = null;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.countryCode = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.countryCode);
    return writer.getBuffer();
  }

  toString(): string {
    return `SetShopCountry(countryCode=${this.countryCode})`;
  }

  static getId(): number {
    return 921004371;
  }
}
