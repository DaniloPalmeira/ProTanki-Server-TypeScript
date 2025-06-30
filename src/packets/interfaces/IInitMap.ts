import { IPacket } from "./IPacket";

export interface IInitMap extends IPacket {
  jsonData: string | null;
}
