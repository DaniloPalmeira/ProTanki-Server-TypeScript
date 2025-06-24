import { BufferReader } from "../../utils/buffer/BufferReader";
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
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `Login(username=${this.username}, password=${"*".repeat(this.password?.length ?? 0)}, rememberMe=${this.rememberMe})`;
  }

  static getId(): number {
    return -739684591;
  }
}
