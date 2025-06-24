import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IGoToRecoveryPassword } from "../interfaces/IGoToRecoveryPassword";
import { BasePacket } from "./BasePacket";

export default class GoToRecoveryPassword extends BasePacket implements IGoToRecoveryPassword {
  email: string;

  constructor(email: string = "") {
    super();
    this.email = email;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.email = reader.readOptionalString() ?? "";
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.email);
    return writer.getBuffer();
  }

  toString(): string {
    return `GoToRecoveryPassword(email=${this.email})`;
  }

  static getId(): number {
    return -2118900410;
  }
}
