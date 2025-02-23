import { IPacket } from "./IPacket";

export interface IRegistration extends IPacket {
  bgResource: number;
  enableRequiredEmail: boolean;
  maxPasswordLength: number;
  minPasswordLengt: number;
}
