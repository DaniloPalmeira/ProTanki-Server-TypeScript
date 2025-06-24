import { ChatModeratorLevel } from "../../models/enums/ChatModeratorLevel";
import { IPacket } from "./IPacket";

export interface IChatMessageUser {
  moderatorLevel: ChatModeratorLevel;
  ip: string | null;
  rank: number;
  uid: string;
}

export interface IChatMessageData {
  source: IChatMessageUser | null;
  target: IChatMessageUser | null;
  message: string;
  isSystem: boolean;
  isWarning: boolean;
}

export interface IChatHistory extends IPacket {
  messages: IChatMessageData[];
}
