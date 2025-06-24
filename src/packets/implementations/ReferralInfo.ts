import { BufferWriter } from "../../utils/buffer/BufferWriter";
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

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.hash);
    writer.writeOptionalString(this.host);
    return writer.getBuffer();
  }

  toString(): string {
    return `ReferralInfo(hash=${this.hash}, host=${this.host})`;
  }

  static getId(): number {
    return 832270655;
  }
}
