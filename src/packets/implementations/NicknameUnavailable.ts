import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { INicknameUnavailable } from "../interfaces/INicknameUnavailable";

export default class NicknameUnavailable extends BasePacket implements INicknameUnavailable {
  suggestions: string[] | null = null;

  constructor(suggestions?: string[] | null) {
    super();
    if (suggestions) {
      this.suggestions = suggestions;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.suggestions = reader.readStringArray();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeStringArray(this.suggestions);
    return writer.getBuffer();
  }

  toString(): string {
    const suggestionsStr = this.suggestions ? `[${this.suggestions.join(", ")}]` : "null";
    return `NicknameUnavailable(suggestions=${suggestionsStr})`;
  }

  static getId(): number {
    return 442888643;
  }
}
