import { IPacket } from "./IPacket";

export interface ILinkEmailRequest extends IPacket {
  email: string | null;
}
