import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IDeclineFriendRequest } from "../interfaces/IDeclineFriendRequest";

export default class DeclineFriendRequest extends BasePacket implements IDeclineFriendRequest {
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
    return `DeclineFriendRequest(nickname=${this.nickname})`;
  }

  static getId(): number {
    return -1588006900;
  }
}
