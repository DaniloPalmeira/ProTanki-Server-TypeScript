import { IPacket } from "./IPacket";

export interface IInviteEnabled extends IPacket {
  requireInviteCode: boolean;
}
