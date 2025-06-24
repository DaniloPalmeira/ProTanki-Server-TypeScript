import { ILogin } from "../interfaces/ILogin";
import { BasePacket } from "./BasePacket";

export default class Login extends BasePacket implements ILogin {
  username?: string;
  password?: string;
  rememberMe: boolean = false;

  read(buffer: Buffer): void {
    let offset = 0;

    let isEmpty = buffer.readInt8(offset) === 1;
    offset += 1;
    if (!isEmpty) {
      const nickLength = buffer.readInt32BE(offset);
      offset += 4;
      this.username = buffer.toString("utf-8", offset, offset + nickLength);
      offset += nickLength;
    }

    isEmpty = buffer.readInt8(offset) === 1;
    offset += 1;
    if (!isEmpty) {
      const passLength = buffer.readInt32BE(offset);
      offset += 4;
      this.password = buffer.toString("utf-8", offset, offset + passLength);
      offset += passLength;
    }

    this.rememberMe = buffer.readInt8(offset) === 1;
  }

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `Login(username=${this.username}, password=${"*".repeat(this.password?.length || 0)}, rememberMe=${this.rememberMe})`;
  }

  static getId(): number {
    return -739684591;
  }
}
