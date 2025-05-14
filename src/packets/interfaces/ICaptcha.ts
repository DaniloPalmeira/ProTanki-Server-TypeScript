import { IPacket } from "./IPacket";

export interface ICaptcha extends IPacket {
  view: number;
  image: Buffer;
}
