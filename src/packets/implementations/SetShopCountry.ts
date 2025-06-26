import { BufferReader } from "../../utils/buffer/BufferReader";
import { BasePacket } from "./BasePacket";
import { ISetShopCountry } from "../interfaces/ISetShopCountry";

export default class SetShopCountry extends BasePacket implements ISetShopCountry {
  countryCode: string | null = null;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.countryCode = reader.readOptionalString();
  }

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `SetShopCountry(countryCode=${this.countryCode})`;
  }

  static getId(): number {
    return 921004371;
  }
}
