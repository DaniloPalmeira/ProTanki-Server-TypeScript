import { IPacket } from "./IPacket";

export interface IRequestCaptcha extends IPacket {
  view: number;
}
