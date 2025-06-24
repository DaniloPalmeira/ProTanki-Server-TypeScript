import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IRecoveryAccountVerifyCode } from "../interfaces/IRecoveryAccountVerifyCode";

export default class RecoveryAccountVerifyCode extends BasePacket implements IRecoveryAccountVerifyCode {
  code: string | null;

  constructor(code: string | null) {
    super();
    this.code = code;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.code = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.code);
    return writer.getBuffer();
  }

  toString(): string {
    return `RecoveryAccountVerifyCode(code=${this.code})`;
  }

  static getId(): number {
    return 903498755;
  }
}
