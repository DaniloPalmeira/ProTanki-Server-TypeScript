import { BufferReader } from "../../utils/buffer/BufferReader";
import { BasePacket } from "./BasePacket";
import { IDeclineFriendRequest } from "../interfaces/IDeclineFriendRequest";

export default class DeclineFriendRequest extends BasePacket implements IDeclineFriendRequest {
  nickname: string | null = null;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.nickname = reader.readOptionalString();
  }

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `DeclineFriendRequest(nickname=${this.nickname})`;
  }

  static getId(): number {
    return -1588006900;
  }
}
