import { IPacket } from "./IPacket";

export interface IShopItems extends IPacket {
  jsonData: string | null;
}
