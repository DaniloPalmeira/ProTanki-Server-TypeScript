import { BasePacket } from "./BasePacket";
import { IRecoveryAccountVerifyCode } from "../interfaces/IRecoveryAccountVerifyCode";

export default class RecoveryAccountVerifyCode extends BasePacket implements IRecoveryAccountVerifyCode {
  code: string;

  constructor(code: string = "") {
    super();
    this.code = code;
  }

  read(buffer: Buffer): void {
    const isEmpty = buffer.readInt8(0) === 1;
    if (isEmpty) {
      this.code = "";
      return;
    }
    const length = buffer.readInt32BE(1);
    this.code = buffer.toString("utf8", 5, 5 + length);
  }

  write(): Buffer {
    if (this.code.length == 0) {
      return Buffer.from([1]);
    }
    const stringBuffer = Buffer.from(this.code, "utf8");
    const packetSize = 1 + 4 + stringBuffer.length;
    const buffer = Buffer.alloc(packetSize);
    buffer.writeInt8(0, 0);
    buffer.writeInt32BE(stringBuffer.length, 1);
    stringBuffer.copy(buffer, 5);
    return buffer;
  }

  toString(): string {
    return `RecoveryAccountVerifyCode(code=${this.code})`;
  }

  static getId(): number {
    return 903498755;
  }
}
