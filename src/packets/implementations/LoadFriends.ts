import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ILoadFriends } from "../interfaces/ILoadFriends";
import { BasePacket } from "./BasePacket";

export default class LoadFriends extends BasePacket implements ILoadFriends {
  unknown: boolean = false;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.unknown = reader.readUInt8() === 1;
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeUInt8(this.unknown ? 1 : 0);
    return writer.getBuffer();
  }

  toString(): string {
    return `LoadFriends(unknown=${this.unknown})`;
  }

  static getId(): number {
    return -731115522;
  }
}
