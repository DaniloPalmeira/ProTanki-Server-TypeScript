import { IPacket } from "./IPacket";

export interface IBattleDetails extends IPacket {
  jsonData: string | null;
}
