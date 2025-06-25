import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IAlreadyFriends } from "../interfaces/IAlreadyFriends";

export default class AlreadyFriends extends BasePacket implements IAlreadyFriends {
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
    return `AlreadyFriends(nickname=${this.nickname})`;
  }

  static getId(): number {
    return -2089008699;
  }
}
