import { IPacket } from "./IPacket";

export interface ILoginByTokenRequest extends IPacket {
  hash: string | null;
}
