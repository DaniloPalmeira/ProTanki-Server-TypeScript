import { IPacket } from "./IPacket";

export interface ICreateAccount extends IPacket {
  nickname: string | null;
  password: string | null;
  rememberMe: boolean;
}
