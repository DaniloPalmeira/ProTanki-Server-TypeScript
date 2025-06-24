import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IFriendRequestSent } from "../interfaces/IFriendRequestSent";

export default class FriendRequestSent extends BasePacket implements IFriendRequestSent {
  nickname: string | null;

  constructor(nickname: string | null) {
    super();
    this.nickname = nickname;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.nickname);
    return writer.getBuffer();
  }

  toString(): string {
    return `FriendRequestSent(nickname=${this.nickname})`;
  }

  static getId(): number {
    return -1241704092;
  }
}
