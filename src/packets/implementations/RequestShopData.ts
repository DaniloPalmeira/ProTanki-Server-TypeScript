import { BasePacket } from "./BasePacket";
import { IRequestShopData } from "../interfaces/IRequestShopData";

export default class RequestShopData extends BasePacket implements IRequestShopData {
  read(buffer: Buffer): void {}

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `RequestShopData()`;
  }

  static getId(): number {
    return 1153801756;
  }
}
