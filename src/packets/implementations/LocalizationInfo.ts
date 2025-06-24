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

  private getOptionalStringSize(value: string): number {
    return 1 + 4 + Buffer.byteLength(value, "utf8");
  }

  private writeOptionalStringToBuffer(buffer: Buffer, offset: number, value: string): number {
    offset = buffer.writeUInt8(0, offset);
    const valueBuffer = Buffer.from(value, "utf8");
    offset = buffer.writeInt32BE(valueBuffer.length, offset);
    valueBuffer.copy(buffer, offset);
    offset += valueBuffer.length;
    return offset;
  }

  write(): Buffer {
    let totalSize = 4; // count
    for (const country of this.countries) {
      totalSize += this.getOptionalStringSize(country[0]);
      totalSize += this.getOptionalStringSize(country[1]);
    }
    totalSize += this.getOptionalStringSize(this.defaultCountryCode);
    totalSize += 1; // locationCheckEnabled

    const packet = Buffer.alloc(totalSize);
    let offset = 0;

    offset = packet.writeInt32BE(this.countries.length, offset);

    for (const country of this.countries) {
      offset = this.writeOptionalStringToBuffer(packet, offset, country[0]);
      offset = this.writeOptionalStringToBuffer(packet, offset, country[1]);
    }

    offset = this.writeOptionalStringToBuffer(packet, offset, this.defaultCountryCode);
    offset = packet.writeUInt8(this.locationCheckEnabled ? 1 : 0, offset);

    return packet;
  }

  toString(): string {
    return `LocalizationInfo(countries=${this.countries.length}, default=${this.defaultCountryCode})`;
  }

  static getId(): number {
    return -1232334539;
  }
}
