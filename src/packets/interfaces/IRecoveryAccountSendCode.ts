import { IPacket } from "./IPacket";

export interface IRecoveryAccountSendCode extends IPacket {
  email: string;
}
