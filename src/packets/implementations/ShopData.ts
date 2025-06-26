import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IShopData } from "../interfaces/IShopData";

export default class ShopData extends BasePacket implements IShopData {
  payload: string | null;

  constructor(payload: string | null) {
    super();
    this.payload = payload;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.payload);
    return writer.getBuffer();
  }

  toString(): string {
    return `ShopData()`;
  }

  static getId(): number {
    return 1863710730;
  }
}
