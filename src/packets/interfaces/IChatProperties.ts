import { ChatModeratorLevel } from "../../models/enums/ChatModeratorLevel";
import { IPacket } from "./IPacket";

export interface IChatPropertiesProps {
  admin: boolean;
  antifloodEnabled: boolean;
  bufferSize: number;
  chatEnabled: boolean;
  chatModeratorLevel: ChatModeratorLevel;
  linksWhiteList: string[];
  minChar: number;
  minWord: number;
  selfName: string;
  showLinks: boolean;
  typingSpeedAntifloodEnabled: boolean;
}

export interface IChatProperties extends IChatPropertiesProps, IPacket {}
