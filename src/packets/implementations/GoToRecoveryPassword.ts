import { IGoToRecoveryPassword } from "../interfaces/IGoToRecoveryPassword";
import { BasePacket } from "./BasePacket";

export default class GoToRecoveryPassword extends BasePacket implements IGoToRecoveryPassword {
  email: string;

  constructor(email: string = "") {
    super();
    this.email = email;
  }

  read(buffer: Buffer): void {
    const isEmpty = buffer.readInt8(0) === 1;
    if (!isEmpty) {
      const length = buffer.readInt32BE(1);
      this.email = buffer.toString("utf8", 5, 5 + length);
    }
  }

  write(): Buffer {
    const isEmpty = this.email.length === 0;
    if (isEmpty) {
      return Buffer.from([1]);
    }

    const stringBuffer = Buffer.from(this.email, "utf8");
    const packet = Buffer.alloc(1 + 4 + stringBuffer.length);

    packet.writeInt8(0, 0);
    packet.writeInt32BE(stringBuffer.length, 1);
    stringBuffer.copy(packet, 5);

    return packet;
  }

  toString(): string {
    return `GoToRecoveryPassword(email=${this.email})`;
  }

  getId(): number {
    return -2118900410;
  }
}
