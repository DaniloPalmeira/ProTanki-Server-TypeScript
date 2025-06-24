import { BufferReader } from "../../utils/buffer/BufferReader";
import { BasePacket } from "./BasePacket";
import { ISendFriendRequest } from "../interfaces/ISendFriendRequest";

export default class SendFriendRequest extends BasePacket implements ISendFriendRequest {
  nickname: string | null = null;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.nickname = reader.readOptionalString();
  }

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `SendFriendRequest(nickname=${this.nickname})`;
  }

  static getId(): number {
    return -1457773660;
  }
}
