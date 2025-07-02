import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IEquipItemRequest } from "../interfaces/IEquipItemRequest";
import { BasePacket } from "./BasePacket";

export default class EquipItemRequestPacket extends BasePacket implements IEquipItemRequest {
  itemId: string | null = null;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.itemId = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.itemId);
    return writer.getBuffer();
  }

  toString(): string {
    return `EquipItemRequestPacket(itemId=${this.itemId})`;
  }

  static getId(): number {
    return -1505530736;
  }
}
