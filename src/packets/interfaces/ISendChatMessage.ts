import { IPacket } from "./IPacket";

export interface ISendChatMessage extends IPacket {
  targetNickname: string | null;
  message: string;
}
