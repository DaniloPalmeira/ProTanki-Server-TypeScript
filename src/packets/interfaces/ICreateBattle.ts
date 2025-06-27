import { IBattleCreationSettings } from "../../models/Battle";
import { IPacket } from "./IPacket";

export interface ICreateBattleRequest extends IPacket, IBattleCreationSettings {}

export interface ICreateBattleResponse extends IPacket {
  jsonData: string | null;
}
