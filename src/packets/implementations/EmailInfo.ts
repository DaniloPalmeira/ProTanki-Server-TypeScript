import { IEmailInfo } from "../interfaces/IEmailInfo";
import { BasePacket } from "./BasePacket";

export default class EmailInfo extends BasePacket implements IEmailInfo {
  email: string | null;
  emailConfirmed: boolean;

  constructor(email: string | null, emailConfirmed: boolean) {
    super();
    this.email = email;
    this.emailConfirmed = emailConfirmed;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  write(): Buffer {
    const isEmailEmpty = !this.email;
    const emailBuffer = isEmailEmpty ? Buffer.alloc(0) : Buffer.from(this.email!, "utf8");

    const packetSize = 1 + (isEmailEmpty ? 0 : 4 + emailBuffer.length) + 1;
    const packet = Buffer.alloc(packetSize);
    let offset = 0;

    packet.writeInt8(isEmailEmpty ? 1 : 0, offset);
    offset += 1;

    if (!isEmailEmpty) {
      packet.writeInt32BE(emailBuffer.length, offset);
      offset += 4;
      emailBuffer.copy(packet, offset);
      offset += emailBuffer.length;
    }

    packet.writeInt8(this.emailConfirmed ? 1 : 0, offset);

    return packet;
  }

  toString(): string {
    return `EmailInfo(email=${this.email}, confirmed=${this.emailConfirmed})`;
  }

  static getId(): number {
    return 613462801;
  }
}
