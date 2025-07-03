import { IPacket } from "./IPacket";

export interface IBattleChatMessageData {
  nickname: string | null;
  message: string | null;
  team: number;
}

export interface IBattleChatMessage extends IPacket, IBattleChatMessageData {}
