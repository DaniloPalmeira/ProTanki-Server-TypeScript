import { IPacket } from "./IPacket";

export interface IInviteCode extends IPacket {
  inviteCode: string | null;
}
