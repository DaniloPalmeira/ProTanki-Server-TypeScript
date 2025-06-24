import { BasePacket } from "./BasePacket";
import { INicknameUnavailable } from "../interfaces/INicknameUnavailable";

export default class NicknameUnavailable extends BasePacket implements INicknameUnavailable {
  suggestions: string[];

  constructor(suggestions: string[] = []) {
    super();
    this.suggestions = suggestions;
  }

  read(buffer: Buffer): void {
    let offset = 0;
    const isVectorEmpty = buffer.readInt8(offset) === 1;
    offset += 1;

    if (isVectorEmpty) {
      this.suggestions = [];
      return;
    }

    const count = buffer.readInt32BE(offset);
    offset += 4;

    this.suggestions = [];
    for (let i = 0; i < count; i++) {
      const isStringEmpty = buffer.readInt8(offset) === 1;
      offset += 1;
      if (isStringEmpty) {
        this.suggestions.push("");
      } else {
        const length = buffer.readInt32BE(offset);
        offset += 4;
        this.suggestions.push(buffer.toString("utf8", offset, offset + length));
        offset += length;
      }
    }
  }

  write(): Buffer {
    const isVectorEmpty = !this.suggestions || this.suggestions.length === 0;
    if (isVectorEmpty) {
      return Buffer.from([1]);
    }

    let totalSize = 1 + 4;
    for (const str of this.suggestions) {
      if (str.length === 0) {
        totalSize += 1;
      } else {
        totalSize += 1 + 4 + Buffer.byteLength(str, "utf8");
      }
    }

    const packet = Buffer.alloc(totalSize);
    let offset = 0;

    offset = packet.writeUInt8(0, offset);
    offset = packet.writeInt32BE(this.suggestions.length, offset);

    for (const str of this.suggestions) {
      const isStringEmpty = str.length === 0;
      offset = packet.writeUInt8(isStringEmpty ? 1 : 0, offset);
      if (!isStringEmpty) {
        const strBuffer = Buffer.from(str, "utf8");
        offset = packet.writeInt32BE(strBuffer.length, offset);
        strBuffer.copy(packet, offset);
        offset += strBuffer.length;
      }
    }

    return packet;
  }

  toString(): string {
    return `NicknameUnavailable(suggestions=${this.suggestions.join(", ")})`;
  }

  static getId(): number {
    return 442888643;
  }
}
