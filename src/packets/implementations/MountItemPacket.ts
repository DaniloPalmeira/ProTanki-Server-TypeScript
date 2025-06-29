import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IMountItem } from "../interfaces/IMountItem";
import { BasePacket } from "./BasePacket";

export default class MountItemPacket extends BasePacket implements IMountItem {
  itemId: string | null;
  unknown: boolean;

  constructor(itemId: string | null = null, unknown: boolean = false) {
    super();
    this.itemId = itemId;
    this.unknown = unknown;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.itemId = reader.readOptionalString();
    this.unknown = reader.readUInt8() === 1;
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.itemId);
    writer.writeUInt8(this.unknown ? 1 : 0);
    return writer.getBuffer();
  }

  toString(): string {
    return `MountItemPacket(itemId=${this.itemId}, unknown=${this.unknown})`;
  }

  static getId(): number {
    return 2062201643;
  }
}
