import { IPacket } from "./IPacket";

export interface IBattleUserEffects extends IPacket {
  jsonData: string | null;
}
