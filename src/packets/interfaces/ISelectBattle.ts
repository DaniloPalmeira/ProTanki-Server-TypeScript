import { IPacket } from "./IPacket";

export interface ISelectBattle extends IPacket {
  battleId: string | null;
}
