import { IPacket } from "./IPacket";

export interface IBattleConsumables extends IPacket {
  jsonData: string | null;
}
