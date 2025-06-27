import { IPacket } from "./IPacket";

export interface IRequestBattleInfo extends IPacket {
  battleId: string | null;
}
