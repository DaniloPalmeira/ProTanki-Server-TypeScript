import { IPacket } from "./IPacket";

export interface IBuyItem extends IPacket {
  itemId: string | null;
  quantity: number;
  price: number;
}
