import { IPacket } from "./IPacket";

export interface IGarageItems extends IPacket {
  jsonData: string | null;
}
