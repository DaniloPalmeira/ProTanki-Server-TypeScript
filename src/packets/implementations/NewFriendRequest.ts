import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { INewFriendRequest } from "../interfaces/INewFriendRequest";

export default class NewFriendRequest extends BasePacket implements INewFriendRequest {
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
    return `NewFriendRequest(nickname=${this.nickname})`;
  }

  static getId(): number {
    return 553380510;
  }
}
