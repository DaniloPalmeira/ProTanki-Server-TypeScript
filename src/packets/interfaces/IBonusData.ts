import { IPacket } from "./IPacket";

export interface IBonusData extends IPacket {
  jsonData: string | null;
}
