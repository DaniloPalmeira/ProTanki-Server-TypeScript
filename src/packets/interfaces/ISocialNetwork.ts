import { IPacket } from "./IPacket";

export interface ISocialNetwork extends IPacket {
  socialNetworkParams: Array<Array<String>>;
}
