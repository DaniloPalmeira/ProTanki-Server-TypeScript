import { IPacket } from "./IPacket";

export interface ISetShopCountry extends IPacket {
  countryCode: string | null;
}
