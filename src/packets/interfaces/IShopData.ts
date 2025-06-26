import { IPacket } from "./IPacket";

export interface IShopData extends IPacket {
  payload: string | null;
}
