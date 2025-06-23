import { IPacket } from "./IPacket";

export interface IUpdatePassword extends IPacket {
  password?: string;
  email?: string;
}
