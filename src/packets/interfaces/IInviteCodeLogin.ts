import { IPacket } from "./IPacket";

export interface IInviteCodeLogin extends IPacket {
  nickname: string | null;
}
