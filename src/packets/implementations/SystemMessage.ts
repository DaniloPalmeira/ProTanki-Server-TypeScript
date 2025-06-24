import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ISystemMessage } from "../interfaces/ISystemMessage";
import { BasePacket } from "./BasePacket";

export default class SystemMessage extends BasePacket implements ISystemMessage {
  text: string | null;

  constructor(text: string | null = null) {
    super();
    this.text = text;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.text = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.text);
    return writer.getBuffer();
  }

  toString(): string {
    return `SystemMessage(text=${this.text})`;
  }

  static getId(): number {
    return -600078553;
  }
}
