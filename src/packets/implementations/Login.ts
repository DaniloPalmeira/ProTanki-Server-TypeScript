import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ILogin } from "../interfaces/ILogin";
import { BasePacket } from "./BasePacket";

export default class Login extends BasePacket implements ILogin {
  username: string | null = null;
  password: string | null = null;
  rememberMe: boolean = false;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.username = reader.readOptionalString();
    this.password = reader.readOptionalString();
    this.rememberMe = reader.readUInt8() === 1;
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.username);
    writer.writeOptionalString(this.password);
    writer.writeUInt8(this.rememberMe ? 1 : 0);
    return writer.getBuffer();
  }

  toString(): string {
    return `Login(username=${this.username}, password=${"*".repeat(this.password?.length ?? 0)}, rememberMe=${this.rememberMe})`;
  }

  static getId(): number {
    return -739684591;
  }
}
