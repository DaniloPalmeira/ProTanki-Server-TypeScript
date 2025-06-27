import { IPacket } from "./IPacket";

export interface IValidateBattleName extends IPacket {
  name: string | null;
}
