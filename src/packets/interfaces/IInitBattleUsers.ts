import { IPacket } from "./IPacket";
import { IBattleUser } from "./IBattleUser";

export interface IInitBattleUsersDM extends IPacket {
  users: IBattleUser[];
}

export interface IInitBattleUsersTeam extends IPacket {
  scoreBlue: number;
  scoreRed: number;
  usersBlue: IBattleUser[];
  usersRed: IBattleUser[];
}
