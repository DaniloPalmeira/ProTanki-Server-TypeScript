import { IPacket } from "./IPacket";

export interface IMountItem extends IPacket {
  itemId: string | null;
  unknown: boolean;
}
