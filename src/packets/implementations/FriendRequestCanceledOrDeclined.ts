import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IFriendRequestCanceledOrDeclined } from "../interfaces/IFriendRequestCanceledOrDeclined";

export default class FriendRequestCanceledOrDeclined extends BasePacket implements IFriendRequestCanceledOrDeclined {
  nickname: string | null = null;

  constructor(nickname?: string | null) {
    super();
    if (nickname) {
      this.nickname = nickname;
    }
  }

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
    return `FriendRequestCanceledOrDeclined(nickname=${this.nickname})`;
  }

  static getId(): number {
    return 614714702;
  }
}
