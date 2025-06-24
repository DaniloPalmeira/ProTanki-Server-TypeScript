import { BasePacket } from "./BasePacket";
import { IReferralInfoDetails, IReferredUser } from "../interfaces/IReferralInfoDetails";

export default class ReferralInfoDetails extends BasePacket implements IReferralInfoDetails {
  referredUsers: IReferredUser[];
  url: string;
  bannerCodeString: string;
  defaultRefMessage: string;

  constructor(referredUsers: IReferredUser[], url: string, bannerCode: string, defaultMessage: string) {
    super();
    this.referredUsers = referredUsers;
    this.url = url;
    this.bannerCodeString = bannerCode;
    this.defaultRefMessage = defaultMessage;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  private getPresentStringSize(value: string): number {
    // Para este pacote, a string está sempre "presente".
    // O tamanho é: flag (1 byte) + comprimento (4 bytes) + dados da string.
    return 1 + 4 + Buffer.byteLength(value, "utf8");
  }

  private writePresentStringToBuffer(buffer: Buffer, offset: number, value: string): number {
    // Para este pacote, a flag 'isEmpty' é sempre 0 (false).
    offset = buffer.writeUInt8(0, offset);
    const valueBuffer = Buffer.from(value, "utf8");
    offset = buffer.writeInt32BE(valueBuffer.length, offset);
    valueBuffer.copy(buffer, offset);
    offset += valueBuffer.length;
    return offset;
  }

  write(): Buffer {
    let totalSize = 4; // referredUsers quantity

    for (const ref of this.referredUsers) {
      totalSize += 4; // income
      totalSize += this.getPresentStringSize(ref.user);
    }

    totalSize += this.getPresentStringSize(this.url);
    totalSize += this.getPresentStringSize(this.bannerCodeString);
    totalSize += this.getPresentStringSize(this.defaultRefMessage);

    const packet = Buffer.alloc(totalSize);
    let offset = 0;

    offset = packet.writeInt32BE(this.referredUsers.length, offset);
    for (const ref of this.referredUsers) {
      offset = packet.writeInt32BE(ref.income, offset);
      offset = this.writePresentStringToBuffer(packet, offset, ref.user);
    }

    offset = this.writePresentStringToBuffer(packet, offset, this.url);
    offset = this.writePresentStringToBuffer(packet, offset, this.bannerCodeString);
    offset = this.writePresentStringToBuffer(packet, offset, this.defaultRefMessage);

    return packet;
  }

  toString(): string {
    return `ReferralInfoDetails(referredCount=${this.referredUsers.length})`;
  }

  static getId(): number {
    return 1587315905;
  }
}
