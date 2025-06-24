import { BufferReader } from "../../utils/buffer/BufferReader";
import { BasePacket } from "./BasePacket";
import { ISetNotifications } from "../interfaces/ISetNotifications";

export default class SetNotifications extends BasePacket implements ISetNotifications {
  enabled: boolean = false;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.enabled = reader.readUInt8() === 1;
  }

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `SetNotifications(enabled=${this.enabled})`;
  }

  static getId(): number {
    return 1312986424;
  }
}
