import { IReferralInfo } from "../interfaces/IReferralInfo";
import { BasePacket } from "./BasePacket";

export default class ReferralInfo extends BasePacket implements IReferralInfo {
  hash: string;
  host: string;

  constructor(hash: string, host: string) {
    super();
    this.hash = hash;
    this.host = host;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  private writeOptionalString(value: string): Buffer {
    const isEmpty = value.length === 0;
    if (isEmpty) {
      return Buffer.from([1]);
    }

    const stringBuffer = Buffer.from(value, "utf8");
    const header = Buffer.alloc(5);
    header.writeInt8(0, 0);
    header.writeInt32BE(stringBuffer.length, 1);

    return Buffer.concat([header, stringBuffer]);
  }

  write(): Buffer {
    const hashBuffer = this.writeOptionalString(this.hash);
    const hostBuffer = this.writeOptionalString(this.host);

    return Buffer.concat([hashBuffer, hostBuffer]);
  }

  toString(): string {
    return `ReferralInfo(hash=${this.hash}, host=${this.host})`;
  }

  static getId(): number {
    return 832270655;
  }
}
