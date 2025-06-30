import { IPacket } from "./IPacket";

export interface IEquipItemRequest extends IPacket {
  itemId: string | null;
}
