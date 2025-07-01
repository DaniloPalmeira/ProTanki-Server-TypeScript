import { IPacket } from "./IPacket";
import { ChatModeratorLevel } from "../../models/enums/ChatModeratorLevel";

export interface IBattleUserInfo {
  ChatModeratorLevel: ChatModeratorLevel;
  deaths: number;
  kills: number;
  rank: number;
  score: number;
  nickname: string | null;
}

export interface IUserConnectDM extends IPacket {
  nickname: string | null;
  usersInfo: IBattleUserInfo[];
}
