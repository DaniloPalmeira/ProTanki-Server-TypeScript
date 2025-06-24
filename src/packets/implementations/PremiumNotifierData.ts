import { BufferWriter } from "../../utils/buffer/BufferWriter";
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
    const writer = new BufferWriter();
    writer.writeInt32BE(this.premiumTimeLeftInSeconds);
    writer.writeOptionalString(this.nickname);
    return writer.getBuffer();
  }

  toString(): string {
    return `PremiumNotifierData(nickname=${this.nickname}, timeLeft=${this.premiumTimeLeftInSeconds})`;
  }

  static getId(): number {
    return -2069508071;
  }
}
