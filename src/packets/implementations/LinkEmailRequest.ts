import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { ILinkEmailRequest } from "../interfaces/ILinkEmailRequest";

export default class LinkEmailRequest extends BasePacket implements ILinkEmailRequest {
  email: string | null = null;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.email = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.email);
    return writer.getBuffer();
  }

  toString(): string {
    return `LinkEmailRequest(email=${this.email})`;
  }

  static getId(): number {
    return -20486732;
  }
}
