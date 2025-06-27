import { IPacket } from "./IPacket";

export interface IConfirmBattleInfo extends IPacket {
  battleId: string | null;
}
