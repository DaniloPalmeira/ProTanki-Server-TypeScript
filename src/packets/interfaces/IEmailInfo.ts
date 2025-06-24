import { IPacket } from "./IPacket";

export interface IEmailInfo extends IPacket {
  email: string | null;
  emailConfirmed: boolean;
}
