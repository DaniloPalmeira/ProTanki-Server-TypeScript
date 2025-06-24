import { IPacket } from "./IPacket";

export interface ICaptchaVerify extends IPacket {
  view: number;
  solution: string | null;
}
