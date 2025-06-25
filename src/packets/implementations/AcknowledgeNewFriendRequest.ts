import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IAcknowledgeNewFriendRequest } from "../interfaces/IAcknowledgeNewFriendRequest";

export default class AcknowledgeNewFriendRequest extends BasePacket implements IAcknowledgeNewFriendRequest {
  nickname: string | null;

  constructor(nickname: string | null = null) {
    super();
    this.nickname = nickname;
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
    return `AcknowledgeNewFriendRequest(nickname=${this.nickname})`;
  }

  static getId(): number {
    return -1041660861;
  }
}
