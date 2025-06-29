import { IPacket } from "./IPacket";

export interface ILoginToken extends IPacket {
  hash: string | null;
}
