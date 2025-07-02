import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { ICancelFriendRequest } from "../interfaces/ICancelFriendRequest";

export default class CancelFriendRequest extends BasePacket implements ICancelFriendRequest {
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
    return `CancelFriendRequest(nickname=${this.nickname})`;
  }

  static getId(): number {
    return 84050355;
  }
}
