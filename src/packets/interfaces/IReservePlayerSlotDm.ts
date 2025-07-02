import { IPacket } from "./IPacket";

export interface IReservePlayerSlotDm extends IPacket {
  battleId: string | null;
  nickname: string | null;
}
