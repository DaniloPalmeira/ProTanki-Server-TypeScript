import { IPacket } from "./IPacket";

export interface IGoToRecoveryPassword extends IPacket {
  email: string | null;
}
