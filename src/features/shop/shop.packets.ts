import { BasePacket } from "@/packets/BasePacket";
import { BufferReader } from "@/utils/buffer/buffer.reader";
import { BufferWriter } from "@/utils/buffer/buffer.writer";
import * as ShopTypes from "./shop.types";

export class LocalizationInfo extends BasePacket implements ShopTypes.ILocalizationInfo {
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
    static getId(): number {
        return -1232334539;
    }
}

export class RequestPaymentWindow extends BasePacket implements ShopTypes.IRequestPaymentWindow {
    read(buffer: Buffer): void { }
    write(): Buffer {
        return new BufferWriter().getBuffer();
    }
    static getId(): number {
        return -296048697;
    }
}

export class RequestShopData extends BasePacket implements ShopTypes.IRequestShopData {
    read(buffer: Buffer): void { }
    write(): Buffer {
        return new BufferWriter().getBuffer();
    }
    static getId(): number {
        return 1153801756;
    }
}

export class SetShopCountry extends BasePacket implements ShopTypes.ISetShopCountry {
    countryCode: string | null = null;
    read(buffer: Buffer): void {
        this.countryCode = new BufferReader(buffer).readOptionalString();
    }
    write(): Buffer {
        return new BufferWriter().writeOptionalString(this.countryCode).getBuffer();
    }
    static getId(): number {
        return 921004371;
    }
}

export class ShopData extends BasePacket implements ShopTypes.IShopData {
    payload: string | null = null;
    constructor(payload?: string | null) {
        super();
        if (payload) {
            this.payload = payload;
        }
    }
    read(buffer: Buffer): void {
        this.payload = new BufferReader(buffer).readOptionalString();
    }
    write(): Buffer {
        return new BufferWriter().writeOptionalString(this.payload).getBuffer();
    }
    static getId(): number {
        return 1863710730;
    }
}

export class ShowPaymentWindow extends BasePacket implements ShopTypes.IShowPaymentWindow {
    read(buffer: Buffer): void { }
    write(): Buffer {
        return new BufferWriter().getBuffer();
    }
    static getId(): number {
        return 1870342869;
    }
}