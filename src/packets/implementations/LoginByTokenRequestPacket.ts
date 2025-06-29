import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ILoginByTokenRequest } from "../interfaces/ILoginByTokenRequest";
import { BasePacket } from "./BasePacket";

export default class LoginByTokenRequestPacket extends BasePacket implements ILoginByTokenRequest {
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
    return `LoginByTokenRequestPacket(hash=${this.hash})`;
  }

  static getId(): number {
    return -845588810;
  }
}
