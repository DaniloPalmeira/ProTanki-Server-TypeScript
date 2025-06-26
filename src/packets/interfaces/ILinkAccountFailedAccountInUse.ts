import { IPacket } from "./IPacket";

export interface ILinkAccountFailedAccountInUse extends IPacket {
  method: string | null;
}
