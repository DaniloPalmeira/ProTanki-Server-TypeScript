import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ILoginToken } from "../interfaces/ILoginToken";
import { BasePacket } from "./BasePacket";

export default class LoginTokenPacket extends BasePacket implements ILoginToken {
  hash: string | null;

  constructor(hash: string | null = null) {
    super();
    this.hash = hash;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.hash = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.hash);
    return writer.getBuffer();
  }

  toString(): string {
    return `LoginTokenPacket(hash=${this.hash})`;
  }

  static getId(): number {
    return 932564569;
  }
}
