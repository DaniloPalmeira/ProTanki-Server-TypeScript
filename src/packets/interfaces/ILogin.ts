import { IPacket } from "./IPacket";

export interface ILogin extends IPacket {
  username: string | null;
  password: string | null;
  rememberMe: boolean;
}
