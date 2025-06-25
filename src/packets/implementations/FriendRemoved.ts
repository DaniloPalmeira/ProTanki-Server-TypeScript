import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IFriendRemoved } from "../interfaces/IFriendRemoved";

export default class FriendRemoved extends BasePacket implements IFriendRemoved {
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
    return `FriendRemoved(nickname=${this.nickname})`;
  }

  static getId(): number {
    return 1716773193;
  }
}
