import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { ILinkAccountFailedAccountInUse } from "../interfaces/ILinkAccountFailedAccountInUse";

export default class LinkAccountFailedAccountInUse extends BasePacket implements ILinkAccountFailedAccountInUse {
  method: string | null;

  constructor(method: string | null) {
    super();
    this.method = method;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.method);
    return writer.getBuffer();
  }

  toString(): string {
    return `LinkAccountFailedAccountInUse(method=${this.method})`;
  }

  static getId(): number {
    return -20513325;
  }
}
