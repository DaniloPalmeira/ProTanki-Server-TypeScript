import { BufferReader } from "../../utils/buffer/BufferReader";
import { ICheckUserExistsForFriend } from "../interfaces/ICheckUserExistsForFriend";
import { BasePacket } from "./BasePacket";

export default class CheckUserExistsForFriend extends BasePacket implements ICheckUserExistsForFriend {
  nickname: string | null = null;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.nickname = reader.readOptionalString();
  }

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `CheckUserExistsForFriend(nickname=${this.nickname})`;
  }

  static getId(): number {
    return 126880779;
  }
}
