import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IReferralInfoDetails, IReferredUser } from "../interfaces/IReferralInfoDetails";

export default class ReferralInfoDetails extends BasePacket implements IReferralInfoDetails {
  referredUsers: IReferredUser[];
  url: string;
  bannerCodeString: string;
  defaultRefMessage: string;

  constructor(referredUsers: IReferredUser[], url: string, bannerCode: string, defaultMessage: string) {
    super();
    this.referredUsers = referredUsers;
    this.url = url;
    this.bannerCodeString = bannerCode;
    this.defaultRefMessage = defaultMessage;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.referredUsers.length);
    for (const ref of this.referredUsers) {
      writer.writeInt32BE(ref.income);
      writer.writeOptionalString(ref.user);
    }

    writer.writeOptionalString(this.url);
    writer.writeOptionalString(this.bannerCodeString);
    writer.writeOptionalString(this.defaultRefMessage);

    return writer.getBuffer();
  }

  toString(): string {
    return `ReferralInfoDetails(referredCount=${this.referredUsers.length})`;
  }

  static getId(): number {
    return 1587315905;
  }
}
