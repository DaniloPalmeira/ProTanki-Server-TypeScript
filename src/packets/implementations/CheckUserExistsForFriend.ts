import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ICheckUserExistsForFriend } from "../interfaces/ICheckUserExistsForFriend";
import { BasePacket } from "./BasePacket";

export default class CheckUserExistsForFriend extends BasePacket implements ICheckUserExistsForFriend {
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
    return `CheckUserExistsForFriend(nickname=${this.nickname})`;
  }

  static getId(): number {
    return 126880779;
  }
}
