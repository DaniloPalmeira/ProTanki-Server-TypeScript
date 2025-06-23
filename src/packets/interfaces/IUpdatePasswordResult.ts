import { IPacket } from "./IPacket";

export interface IUpdatePasswordResult extends IPacket {
  isError: boolean;
  message: string;
}
