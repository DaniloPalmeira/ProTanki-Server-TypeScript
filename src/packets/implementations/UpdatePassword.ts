import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IUpdatePassword } from "../interfaces/IUpdatePassword";
import { BasePacket } from "./BasePacket";

export default class UpdatePassword extends BasePacket implements IUpdatePassword {
  password: string | null = null;
  email: string | null = null;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.password = reader.readOptionalString();
    this.email = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.password);
    writer.writeOptionalString(this.email);
    return writer.getBuffer();
  }

  toString(): string {
    return `UpdatePassword(email=${this.email}, password=${"*".repeat(this.password?.length ?? 0)})`;
  }

  static getId(): number {
    return 762959326;
  }
}
