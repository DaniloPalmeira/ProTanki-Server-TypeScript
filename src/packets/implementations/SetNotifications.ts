import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { ISetNotifications } from "../interfaces/ISetNotifications";

export default class SetNotifications extends BasePacket implements ISetNotifications {
  enabled: boolean = false;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.enabled = reader.readUInt8() === 1;
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeUInt8(this.enabled ? 1 : 0);
    return writer.getBuffer();
  }

  toString(): string {
    return `SetNotifications(enabled=${this.enabled})`;
  }

  static getId(): number {
    return 1312986424;
  }
}
