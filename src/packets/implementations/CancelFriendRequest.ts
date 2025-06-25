import { BufferReader } from "../../utils/buffer/BufferReader";
import { BasePacket } from "./BasePacket";
import { ICancelFriendRequest } from "../interfaces/ICancelFriendRequest";

export default class CancelFriendRequest extends BasePacket implements ICancelFriendRequest {
  nickname: string | null = null;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.nickname = reader.readOptionalString();
  }

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `CancelFriendRequest(nickname=${this.nickname})`;
  }

  static getId(): number {
    return 84050355;
  }
}
