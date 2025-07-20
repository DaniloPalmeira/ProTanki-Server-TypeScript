import { IPacket } from "@/packets/interfaces/IPacket";
import { IEmpty } from "@/packets/interfaces/IEmpty";

export interface ILocalizationInfo extends IPacket {
    countries: [string, string][];
    defaultCountryCode: string;
    locationCheckEnabled: boolean;
}

export interface IRequestPaymentWindow extends IEmpty { }

export interface IRequestShopData extends IEmpty { }

export interface ISetShopCountry extends IPacket {
    countryCode: string | null;
}

export interface IShopData extends IPacket {
    payload: string | null;
}

export interface IShowPaymentWindow extends IEmpty { }