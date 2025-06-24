import { IPacket } from "./IPacket";

export interface IReferralInfo extends IPacket {
  hash: string;
  host: string;
}
