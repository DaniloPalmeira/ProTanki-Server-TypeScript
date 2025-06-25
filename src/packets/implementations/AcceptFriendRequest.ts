import { BufferReader } from "../../utils/buffer/BufferReader";
import { BasePacket } from "./BasePacket";
import { IAcceptFriendRequest } from "../interfaces/IAcceptFriendRequest";

export default class AcceptFriendRequest extends BasePacket implements IAcceptFriendRequest {
  nickname: string | null = null;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.nickname = reader.readOptionalString();
  }

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `AcceptFriendRequest(nickname=${this.nickname})`;
  }

  static getId(): number {
    return -1926185291;
  }
}
