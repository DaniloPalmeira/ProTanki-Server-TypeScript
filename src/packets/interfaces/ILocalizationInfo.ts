import { IPacket } from "./IPacket";

export interface ILocalizationInfo extends IPacket {
  countries: [string, string][];
  defaultCountryCode: string;
  locationCheckEnabled: boolean;
}
