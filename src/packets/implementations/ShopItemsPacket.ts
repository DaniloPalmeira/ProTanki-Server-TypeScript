import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IShopItems } from "../interfaces/IShopItems";
import { BasePacket } from "./BasePacket";

export default class ShopItemsPacket extends BasePacket implements IShopItems {
  jsonData: string | null;

  constructor(jsonData: string | null = null) {
    super();
    this.jsonData = jsonData;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.jsonData = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.jsonData);
    return writer.getBuffer();
  }

  toString(): string {
    const jsonSubstring = this.jsonData ? this.jsonData.substring(0, 70) + "..." : "null";
    return `ShopItemsPacket(jsonData=${jsonSubstring})`;
  }

  static getId(): number {
    return -300370823;
  }
}
