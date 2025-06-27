import { IPacket } from "./IPacket";

export interface IBattleList extends IPacket {
  jsonData: string | null;
}
