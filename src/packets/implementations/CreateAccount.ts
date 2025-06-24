import { ICreateAccount } from "../interfaces/ICreateAccount";
import { BasePacket } from "./BasePacket";

export default class CreateAccount extends BasePacket implements ICreateAccount {
  nickname?: string;
  password?: string;
  rememberMe: boolean = false;

  read(buffer: Buffer): void {
    let offset = 0;

    let isEmpty = buffer.readInt8(offset) === 1;
    offset += 1;
    if (!isEmpty) {
      const nickLength = buffer.readInt32BE(offset);
      offset += 4;
      this.nickname = buffer.toString("utf-8", offset, offset + nickLength);
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
    return `CreateAccount(nickname=${this.nickname}, password=${"*".repeat(this.password?.length || 0)}, rememberMe=${this.rememberMe})`;
  }

  static getId(): number {
    return 427083290;
  }
}
