import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ICreateAccount } from "../interfaces/ICreateAccount";
import { BasePacket } from "./BasePacket";

export default class CreateAccount extends BasePacket implements ICreateAccount {
  nickname: string | null = null;
  password: string | null = null;
  rememberMe: boolean = false;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.nickname = reader.readOptionalString();
    this.password = reader.readOptionalString();
    this.rememberMe = reader.readUInt8() === 1;
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.nickname);
    writer.writeOptionalString(this.password);
    writer.writeUInt8(this.rememberMe ? 1 : 0);
    return writer.getBuffer();
  }

  toString(): string {
    return `CreateAccount(nickname=${this.nickname}, password=${"*".repeat(this.password?.length ?? 0)}, rememberMe=${this.rememberMe})`;
  }

  static getId(): number {
    return 427083290;
  }
}
