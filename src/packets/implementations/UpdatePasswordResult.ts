import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IUpdatePasswordResult } from "../interfaces/IUpdatePasswordResult";
import { BasePacket } from "./BasePacket";

export default class UpdatePasswordResult extends BasePacket implements IUpdatePasswordResult {
  isError: boolean;
  message: string | null;

  constructor(isError: boolean = false, message: string | null) {
    super();
    this.isError = isError;
    this.message = message;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeUInt8(this.isError ? 1 : 0);
    writer.writeOptionalString(this.message);
    return writer.getBuffer();
  }

  toString(): string {
    return `UpdatePasswordResult(isError=${this.isError}, message=${this.message})`;
  }

  static getId(): number {
    return 1570555748;
  }
}
