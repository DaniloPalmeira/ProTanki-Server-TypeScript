import { IPacket } from "./IPacket";

export interface IBattleInfo extends IPacket {
  jsonData: string | null;
}
