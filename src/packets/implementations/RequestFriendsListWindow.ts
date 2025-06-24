import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IEmpty } from "../interfaces/IEmpty";
import { BasePacket } from "./BasePacket";

export default class RequestFriendsListWindow extends BasePacket implements IEmpty {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return "RequestFriendsListWindow()";
  }

  static getId(): number {
    return 1441234714;
  }
}
