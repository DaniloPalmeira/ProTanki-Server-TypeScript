import { IPacket } from "./IPacket";

export interface IReleasePlayerSlotDmData {
  battleId: string | null;
  nickname: string | null;
}

export interface IReleasePlayerSlotDm extends IPacket, IReleasePlayerSlotDmData {}
