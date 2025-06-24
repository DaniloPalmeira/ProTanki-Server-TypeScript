import { IPacket } from "./IPacket";

export interface IReferredUser {
  user: string;
  income: number;
}

export interface IReferralInfoDetails extends IPacket {
  referredUsers: IReferredUser[];
  url: string;
  bannerCodeString: string;
  defaultRefMessage: string;
}
