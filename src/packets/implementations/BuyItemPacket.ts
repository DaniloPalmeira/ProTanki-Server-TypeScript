import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IBuyItem } from "../interfaces/IBuyItem";
import { BasePacket } from "./BasePacket";

export default class BuyItemPacket extends BasePacket implements IBuyItem {
  itemId: string | null = null;
  quantity: number = 0;
  price: number = 0;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.itemId = reader.readOptionalString();
    this.quantity = reader.readInt32BE();
    this.price = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.itemId);
    writer.writeInt32BE(this.quantity);
    writer.writeInt32BE(this.price);
    return writer.getBuffer();
  }

  toString(): string {
    return `BuyItemPacket(itemId=${this.itemId}, quantity=${this.quantity}, price=${this.price})`;
  }

  static getId(): number {
    return -1961983005;
  }
}
