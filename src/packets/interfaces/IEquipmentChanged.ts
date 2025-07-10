import { IPacket } from "./IPacket";

export interface IEquipmentChanged extends IPacket {
  nickname: string | null;
}
