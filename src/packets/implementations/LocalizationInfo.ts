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
    let bufferParts: Buffer[] = [];

    const countBuffer = Buffer.alloc(4);
    countBuffer.writeInt32BE(this.countries.length, 0);
    bufferParts.push(countBuffer);

    for (const country of this.countries) {
      const [code, name] = country;

      const codeBuffer = Buffer.from(code, "utf8");
      const codeHeader = Buffer.alloc(5);
      codeHeader.writeInt8(0, 0); // Not empty
      codeHeader.writeInt32BE(codeBuffer.length, 1);
      bufferParts.push(codeHeader, codeBuffer);

      const nameBuffer = Buffer.from(name, "utf8");
      const nameHeader = Buffer.alloc(5);
      nameHeader.writeInt8(0, 0); // Not empty
      nameHeader.writeInt32BE(nameBuffer.length, 1);
      bufferParts.push(nameHeader, nameBuffer);
    }

    const defaultCodeBuffer = Buffer.from(this.defaultCountryCode, "utf8");
    const defaultCodeHeader = Buffer.alloc(5);
    defaultCodeHeader.writeInt8(0, 0); // Not empty
    defaultCodeHeader.writeInt32BE(defaultCodeBuffer.length, 1);
    bufferParts.push(defaultCodeHeader, defaultCodeBuffer);

    bufferParts.push(Buffer.from([this.locationCheckEnabled ? 1 : 0]));

    return Buffer.concat(bufferParts);
  }

  toString(): string {
    return `LocalizationInfo(countries=${this.countries.length}, default=${this.defaultCountryCode})`;
  }

  getId(): number {
    return -1232334539;
  }
}
