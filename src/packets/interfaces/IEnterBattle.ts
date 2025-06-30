import { IPacket } from "./IPacket";

export interface IEnterBattle extends IPacket {
  battleTeam: number;
}
