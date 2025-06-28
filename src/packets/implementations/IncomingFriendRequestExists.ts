import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IIncomingFriendRequestExists } from "../interfaces/IIncomingFriendRequestExists";

export default class IncomingFriendRequestExists extends BasePacket implements IIncomingFriendRequestExists {
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
    return `IncomingFriendRequestExists(nickname=${this.nickname})`;
  }

  static getId(): number {
    return -1258754138;
  }
}
