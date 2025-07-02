import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IGetUserInfo } from "../interfaces/IGetUserInfo";
import { BasePacket } from "./BasePacket";

export default class GetUserInfo extends BasePacket implements IGetUserInfo {
  nickname: string | null;

  constructor(nickname: string | null) {
    super();
    this.nickname = nickname;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.nickname = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.nickname);
    return writer.getBuffer();
  }

  toString(): string {
    return `GetUserInfo(nickname=${this.nickname})`;
  }

  static getId(): number {
    return 1774907609;
  }
}
