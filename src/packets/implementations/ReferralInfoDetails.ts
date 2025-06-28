import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IReferralInfoDetails, IReferredUser } from "../interfaces/IReferralInfoDetails";

export default class ReferralInfoDetails extends BasePacket implements IReferralInfoDetails {
  referredUsers: IReferredUser[] = [];
  url: string = "";
  bannerCodeString: string = "";
  defaultRefMessage: string = "";

  constructor(referredUsers?: IReferredUser[], url?: string, bannerCode?: string, defaultMessage?: string) {
    super();
    if (referredUsers) {
      this.referredUsers = referredUsers;
    }
    if (url) {
      this.url = url;
    }
    if (bannerCode) {
      this.bannerCodeString = bannerCode;
    }
    if (defaultMessage) {
      this.defaultRefMessage = defaultMessage;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    const count = reader.readInt32BE();
    this.referredUsers = [];
    for (let i = 0; i < count; i++) {
      this.referredUsers.push({
        income: reader.readInt32BE(),
        user: reader.readOptionalString() ?? "",
      });
    }
    this.url = reader.readOptionalString() ?? "";
    this.bannerCodeString = reader.readOptionalString() ?? "";
    this.defaultRefMessage = reader.readOptionalString() ?? "";
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
    const referredStr = this.referredUsers.map((u) => `{user: ${u.user}, income: ${u.income}}`).join(", ");
    return `ReferralInfoDetails(\n` + `  referredUsers=[${referredStr}],\n` + `  url='${this.url}',\n` + `  bannerCodeString='${this.bannerCodeString}',\n` + `  defaultRefMessage='${this.defaultRefMessage}'\n` + `)`;
  }

  static getId(): number {
    return 1587315905;
  }
}
