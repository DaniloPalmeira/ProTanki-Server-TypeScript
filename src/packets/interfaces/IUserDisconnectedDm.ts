import { IPacket } from "./IPacket";

export interface IUserDisconnectedDm extends IPacket {
  nickname: string | null;
}
