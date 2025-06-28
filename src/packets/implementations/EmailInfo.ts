import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IEmailInfo } from "../interfaces/IEmailInfo";
import { BasePacket } from "./BasePacket";

export default class EmailInfo extends BasePacket implements IEmailInfo {
  email: string | null = null;
  emailConfirmed: boolean = false;

  constructor(email?: string | null, emailConfirmed?: boolean) {
    super();
    if (email) {
      this.email = email;
    }
    if (emailConfirmed) {
      this.emailConfirmed = emailConfirmed;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.email = reader.readOptionalString();
    this.emailConfirmed = reader.readUInt8() === 1;
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.email);
    writer.writeUInt8(this.emailConfirmed ? 1 : 0);
    return writer.getBuffer();
  }

  toString(): string {
    return `EmailInfo(email=${this.email}, confirmed=${this.emailConfirmed})`;
  }

  static getId(): number {
    return 613462801;
  }
}
