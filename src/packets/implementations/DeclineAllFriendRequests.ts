import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IDeclineAllFriendRequests } from "../interfaces/IDeclineAllFriendRequests";

export default class DeclineAllFriendRequests extends BasePacket implements IDeclineAllFriendRequests {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return `DeclineAllFriendRequests()`;
  }

  static getId(): number {
    return -1590185083;
  }
}
