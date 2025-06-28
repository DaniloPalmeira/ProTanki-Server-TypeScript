import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ILocalizationInfo } from "../interfaces/ILocalizationInfo";
import { BasePacket } from "./BasePacket";

export default class LocalizationInfo extends BasePacket implements ILocalizationInfo {
    countries: [string, string][] = [];
    defaultCountryCode: string = "";
    locationCheckEnabled: boolean = false;

    constructor(countries?: [string, string][], defaultCountryCode?: string, locationCheckEnabled?: boolean) {
        super();
        if (countries) {
            this.countries = countries;
        }
        if (defaultCountryCode) {
            this.defaultCountryCode = defaultCountryCode;
        }
        if (locationCheckEnabled !== undefined) {
            this.locationCheckEnabled = locationCheckEnabled;
        }
    }

    read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        const count = reader.readInt32BE();
        this.countries = [];
        for (let i = 0; i < count; i++) {
            const key = reader.readOptionalString() ?? "";
            const value = reader.readOptionalString() ?? "";
            this.countries.push([key, value]);
        }
        this.defaultCountryCode = reader.readOptionalString() ?? "";
        this.locationCheckEnabled = reader.readUInt8() === 1;
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
        const countriesStr = this.countries.map(c => `${c[0]}:${c[1]}`).join(', ');
        return `LocalizationInfo(\n` +
               `  countries=[${countriesStr}],\n` +
               `  defaultCountryCode='${this.defaultCountryCode}',\n` +
               `  locationCheckEnabled=${this.locationCheckEnabled}\n` +
            `)`;
    }

    static getId(): number {
        return -1232334539;
    }
}