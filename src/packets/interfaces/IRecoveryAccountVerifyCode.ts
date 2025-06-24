import { IPacket } from "./IPacket";

export interface IRecoveryAccountVerifyCode extends IPacket {
  code: string | null;
}
