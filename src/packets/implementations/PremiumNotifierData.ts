import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IPremiumNotifierData } from "../interfaces/IPremiumNotifierData";
import { BasePacket } from "./BasePacket";

export default class PremiumNotifierData extends BasePacket implements IPremiumNotifierData {
  premiumTimeLeftInSeconds: number = 0;
  nickname: string = "";

  constructor(premiumTimeLeftInSeconds?: number, nickname?: string) {
    super();
    if (premiumTimeLeftInSeconds !== undefined) {
      this.premiumTimeLeftInSeconds = premiumTimeLeftInSeconds;
    }
    if (nickname) {
      this.nickname = nickname;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.premiumTimeLeftInSeconds = reader.readInt32BE();
    this.nickname = reader.readOptionalString() ?? "";
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.premiumTimeLeftInSeconds);
    writer.writeOptionalString(this.nickname);
    return writer.getBuffer();
  }

  toString(): string {
    return `PremiumNotifierData(nickname='${this.nickname}', timeLeft=${this.premiumTimeLeftInSeconds})`;
  }

  static getId(): number {
    return -2069508071;
  }
}
