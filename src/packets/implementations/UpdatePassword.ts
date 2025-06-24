import { IUpdatePassword } from "../interfaces/IUpdatePassword";
import { BasePacket } from "./BasePacket";

export default class UpdatePassword extends BasePacket implements IUpdatePassword {
  password?: string;
  email?: string;

  read(buffer: Buffer): void {
    let offset = 0;

    let isEmpty = buffer.readInt8(offset) === 1;
    offset += 1;
    if (!isEmpty) {
      const passLength = buffer.readInt32BE(offset);
      offset += 4;
      this.password = buffer.toString("utf-8", offset, offset + passLength);
      offset += passLength;
    }

    isEmpty = buffer.readInt8(offset) === 1;
    offset += 1;
    if (!isEmpty) {
      const emailLength = buffer.readInt32BE(offset);
      offset += 4;
      this.email = buffer.toString("utf-8", offset, offset + emailLength);
      offset += emailLength;
    }
  }

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `UpdatePassword(email=${this.email}, password=${"*".repeat(this.password?.length || 0)})`;
  }

  static getId(): number {
    return 762959326;
  }
}
