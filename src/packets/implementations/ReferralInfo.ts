import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IReferralInfo } from "../interfaces/IReferralInfo";
import { BasePacket } from "./BasePacket";

export default class ReferralInfo extends BasePacket implements IReferralInfo {
  hash: string = "";
  host: string = "";

  constructor(hash?: string, host?: string) {
    super();
    if (hash) {
      this.hash = hash;
    }
    if (host) {
      this.host = host;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.hash = reader.readOptionalString() ?? "";
    this.host = reader.readOptionalString() ?? "";
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.hash);
    writer.writeOptionalString(this.host);
    return writer.getBuffer();
  }

  toString(): string {
    return `ReferralInfo(hash='${this.hash}', host='${this.host}')`;
  }

  static getId(): number {
    return 832270655;
  }
}
