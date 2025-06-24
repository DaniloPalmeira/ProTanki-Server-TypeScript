import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ICheckNicknameAvailable } from "../interfaces/ICheckNicknameAvailable";
import { BasePacket } from "./BasePacket";

export default class CheckNicknameAvailable extends BasePacket implements ICheckNicknameAvailable {
  nickname: string;

  constructor(nickname: string = "") {
    super();
    this.nickname = nickname;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.nickname = reader.readOptionalString() ?? "";
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.nickname);
    return writer.getBuffer();
  }

  toString(): string {
    return `CheckNicknameAvailable(nickname=${this.nickname})`;
  }

  static getId(): number {
    return 1083705823;
  }
}
