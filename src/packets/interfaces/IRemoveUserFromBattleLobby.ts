import { IPacket } from "./IPacket";

export interface IRemoveUserFromBattleLobbyData {
  battleId: string | null;
  nickname: string | null;
}

export interface IRemoveUserFromBattleLobby extends IPacket, IRemoveUserFromBattleLobbyData {}
