import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { ILinkAccountResultSuccess } from "../interfaces/ILinkAccountResultSuccess";

export default class LinkAccountResultSuccess extends BasePacket implements ILinkAccountResultSuccess {
  identifier: string | null = null;

  constructor(identifier?: string | null) {
    super();
    if (identifier) {
      this.identifier = identifier;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.identifier = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.identifier);
    return writer.getBuffer();
  }

  toString(): string {
    return `LinkAccountResultSuccess(identifier=${this.identifier})`;
  }

  static getId(): number {
    return 2098576423;
  }
}
