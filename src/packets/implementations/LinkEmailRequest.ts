import { BufferReader } from "../../utils/buffer/BufferReader";
import { BasePacket } from "./BasePacket";
import { ILinkEmailRequest } from "../interfaces/ILinkEmailRequest";

export default class LinkEmailRequest extends BasePacket implements ILinkEmailRequest {
  email: string | null = null;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.email = reader.readOptionalString();
  }

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `LinkEmailRequest(email=${this.email})`;
  }

  static getId(): number {
    return -20486732;
  }
}
