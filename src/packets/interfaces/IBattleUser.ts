import { ChatModeratorLevel } from "../../models/enums/ChatModeratorLevel";

export interface IBattleUser {
  chatModeratorLevel: ChatModeratorLevel;
  deaths: number;
  kills: number;
  rank: number;
  score: number;
  uid: string | null;
}
