import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ILocalizationInfo } from "../interfaces/ILocalizationInfo";
import { BasePacket } from "./BasePacket";

export default class LocalizationInfo extends BasePacket implements ILocalizationInfo {
  countries: [string, string][];
  defaultCountryCode: string;
  locationCheckEnabled: boolean;

  constructor(countries: [string, string][], defaultCountryCode: string, locationCheckEnabled: boolean) {
    super();
    this.countries = countries;
    this.defaultCountryCode = defaultCountryCode;
    this.locationCheckEnabled = locationCheckEnabled;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.countries.length);

    for (const country of this.countries) {
      writer.writeOptionalString(country[0]);
      writer.writeOptionalString(country[1]);
    }

    writer.writeOptionalString(this.defaultCountryCode);
    writer.writeUInt8(this.locationCheckEnabled ? 1 : 0);

    return writer.getBuffer();
  }

  toString(): string {
    return `LocalizationInfo(countries=${this.countries.length}, default=${this.defaultCountryCode})`;
  }

  static getId(): number {
    return -1232334539;
  }
}
