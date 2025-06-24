import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IRecoveryAccountSendCode } from "../interfaces/IRecoveryAccountSendCode";
import { BasePacket } from "./BasePacket";

export default class RecoveryAccountSendCode extends BasePacket implements IRecoveryAccountSendCode {
  email: string | null;

  constructor(email: string | null) {
    super();
    this.email = email;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.email = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.email);
    return writer.getBuffer();
  }

  toString(): string {
    return `RecoveryAccountSendCode(email=${this.email})`;
  }

  static getId(): number {
    return 1744584433;
  }
}
