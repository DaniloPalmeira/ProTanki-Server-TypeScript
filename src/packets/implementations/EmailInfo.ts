import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IEmailInfo } from "../interfaces/IEmailInfo";
import { BasePacket } from "./BasePacket";

export default class EmailInfo extends BasePacket implements IEmailInfo {
  email: string | null;
  emailConfirmed: boolean;

  constructor(email: string | null, emailConfirmed: boolean) {
    super();
    this.email = email;
    this.emailConfirmed = emailConfirmed;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
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
