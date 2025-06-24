import { IPacket } from "./IPacket";

export interface INicknameUnavailable extends IPacket {
  suggestions: string[] | null;
}
