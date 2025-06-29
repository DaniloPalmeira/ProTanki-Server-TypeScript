import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IUserNotInBattle } from "../interfaces/IUserNotInBattle";
import { BasePacket } from "./BasePacket";

export default class UserNotInBattlePacket extends BasePacket implements IUserNotInBattle {
  nickname: string | null;

  constructor(nickname: string | null = null) {
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
    return `UserNotInBattlePacket(nickname=${this.nickname})`;
  }

  static getId(): number {
    return 1941694508;
  }
}
