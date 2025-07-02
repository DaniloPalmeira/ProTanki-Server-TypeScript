import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IRemoveFriend } from "../interfaces/IRemoveFriend";

export default class RemoveFriend extends BasePacket implements IRemoveFriend {
  nickname: string | null = null;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.nickname = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.nickname);
    return writer.getBuffer();
  }

  toString(): string {
    return `RemoveFriend(nickname=${this.nickname})`;
  }

  static getId(): number {
    return -221757454;
  }
}
