import { IPremiumNotifierData } from "../interfaces/IPremiumNotifierData";
import { BasePacket } from "./BasePacket";

export default class PremiumNotifierData extends BasePacket implements IPremiumNotifierData {
  premiumTimeLeftInSeconds: number;
  nickname: string;

  constructor(premiumTimeLeftInSeconds: number, nickname: string) {
    super();
    this.premiumTimeLeftInSeconds = premiumTimeLeftInSeconds;
    this.nickname = nickname;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  write(): Buffer {
    const nickBuffer = Buffer.from(this.nickname, "utf8");
    const packet = Buffer.alloc(4 + 1 + 4 + nickBuffer.length);
    let offset = 0;

    packet.writeInt32BE(this.premiumTimeLeftInSeconds, offset);
    offset += 4;

    packet.writeInt8(0, offset);
    offset += 1;
    packet.writeInt32BE(nickBuffer.length, offset);
    offset += 4;
    nickBuffer.copy(packet, offset);

    return packet;
  }

  toString(): string {
    return `PremiumNotifierData(nickname=${this.nickname}, timeLeft=${this.premiumTimeLeftInSeconds})`;
  }

  static getId(): number {
    return -2069508071;
  }
}
