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

    const vectorNotEmptyFlag = Buffer.from([0]);

    const countBuffer = Buffer.alloc(4);
    countBuffer.writeInt32BE(this.suggestions.length, 0);

    let stringsBuffer = Buffer.alloc(0);
    for (const str of this.suggestions) {
      const isStringEmpty = str.length === 0;
      if (isStringEmpty) {
        stringsBuffer = Buffer.concat([stringsBuffer, Buffer.from([1])]);
      } else {
        const stringHeader = Buffer.alloc(5);
        stringHeader.writeInt8(0, 0);
        stringHeader.writeInt32BE(str.length, 1);
        stringsBuffer = Buffer.concat([stringsBuffer, stringHeader, Buffer.from(str, "utf8")]);
      }
    }

    return Buffer.concat([vectorNotEmptyFlag, countBuffer, stringsBuffer]);
  }

  toString(): string {
    return `NicknameUnavailable(suggestions=${this.suggestions.join(", ")})`;
  }

  getId(): number {
    return 442888643;
  }
}
