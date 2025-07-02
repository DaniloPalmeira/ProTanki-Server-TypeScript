import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { ISendFriendRequest } from "../interfaces/ISendFriendRequest";

export default class SendFriendRequest extends BasePacket implements ISendFriendRequest {
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
    return `SendFriendRequest(nickname=${this.nickname})`;
  }

  static getId(): number {
    return -1457773660;
  }
}
