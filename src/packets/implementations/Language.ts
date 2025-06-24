import { ILanguage } from "../interfaces/ILanguage";
import { BasePacket } from "./BasePacket";

export default class Language extends BasePacket implements ILanguage {
  lang: string;

  constructor(lang: string = "") {
    super();
    this.lang = lang;
  }

  read(buffer: Buffer): void {
    const isEmpty = buffer.readInt8(0) === 1;
    if (isEmpty) {
      this.lang = "";
      return;
    }
    const length = buffer.readInt32BE(1);
    this.lang = buffer.toString("utf8", 5, 5 + length);
  }

  write(): Buffer {
    if (this.lang.length == 0) {
      return Buffer.from([1]);
    }
    const stringBuffer = Buffer.from(this.lang, "utf8");
    const packetSize = 5 + stringBuffer.length;
    const buffer = Buffer.alloc(packetSize);
    buffer.writeInt32BE(stringBuffer.length, 1);
    stringBuffer.copy(buffer, 5);
    return buffer;
  }

  toString(): string {
    return `Language(lang=${this.lang})`;
  }

  static getId(): number {
    return -1864333717;
  }
}
