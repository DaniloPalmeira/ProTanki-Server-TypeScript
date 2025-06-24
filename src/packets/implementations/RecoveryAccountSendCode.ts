import { IRecoveryAccountSendCode } from "../interfaces/IRecoveryAccountSendCode";
import { BasePacket } from "./BasePacket";

export default class RecoveryAccountSendCode extends BasePacket implements IRecoveryAccountSendCode {
  email: string;

  constructor(email: string = "") {
    super();
    this.email = email;
  }

  read(buffer: Buffer): void {
    const isEmpty = buffer.readInt8(0) === 1;
    if (isEmpty) {
      this.email = "";
      return;
    }
    const length = buffer.readInt32BE(1);
    this.email = buffer.toString("utf8", 5, 5 + length);
  }

  write(): Buffer {
    if (this.email.length == 0) {
      return Buffer.from([1]);
    }
    const stringBuffer = Buffer.from(this.email, "utf8");
    const packetSize = 1 + 4 + stringBuffer.length;
    const buffer = Buffer.alloc(packetSize);
    buffer.writeInt8(0, 0);
    buffer.writeInt32BE(stringBuffer.length, 1);
    stringBuffer.copy(buffer, 5);
    return buffer;
  }

  toString(): string {
    return `RecoveryAccountSendCode(email=${this.email})`;
  }

  static getId(): number {
    return 1744584433;
  }
}
