import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IUpdatePasswordResult } from "../interfaces/IUpdatePasswordResult";
import { BasePacket } from "./BasePacket";

export default class UpdatePasswordResult extends BasePacket implements IUpdatePasswordResult {
  isError: boolean = false;
  message: string | null = null;

  constructor(isError?: boolean, message?: string | null) {
    super();
    if (isError !== undefined) {
      this.isError = isError;
    }
    if (message) {
      this.message = message;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.isError = reader.readUInt8() === 1;
    this.message = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeUInt8(this.isError ? 1 : 0);
    writer.writeOptionalString(this.message);
    return writer.getBuffer();
  }

  toString(): string {
    return `UpdatePasswordResult(isError=${this.isError}, message='${this.message}')`;
  }

  static getId(): number {
    return 1570555748;
  }
}
