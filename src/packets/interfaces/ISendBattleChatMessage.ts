import { IPacket } from "./IPacket";

export interface ISendBattleChatMessage extends IPacket {
  message: string | null;
  team: boolean;
}
