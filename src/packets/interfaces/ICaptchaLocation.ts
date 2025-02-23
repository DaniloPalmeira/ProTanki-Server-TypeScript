import { IPacket } from "./IPacket";

export interface ICaptchaLocation extends IPacket {
  captchaLocations: Array<number>;
}
