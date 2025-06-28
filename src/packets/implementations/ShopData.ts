import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IShopData } from "../interfaces/IShopData";

export default class ShopData extends BasePacket implements IShopData {
  payload: string | null = null;

  constructor(payload?: string | null) {
    super();
    if (payload) {
      this.payload = payload;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.payload = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.payload);
    return writer.getBuffer();
  }

  toString(): string {
    return `ShopData(payload=${this.payload})`;
  }

  static getId(): number {
    return 1863710730;
  }
}
