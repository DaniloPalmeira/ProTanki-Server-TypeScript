import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ILanguage } from "../interfaces/ILanguage";
import { BasePacket } from "./BasePacket";

export default class Language extends BasePacket implements ILanguage {
  lang: string | null;

  constructor(lang: string | null) {
    super();
    this.lang = lang;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.lang = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.lang);
    return writer.getBuffer();
  }

  toString(): string {
    return `Language(lang=${this.lang})`;
  }

  static getId(): number {
    return -1864333717;
  }
}
