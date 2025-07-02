import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IRemoveTank } from "../interfaces/IRemoveTank";
import { BasePacket } from "./BasePacket";

export default class RemoveTankPacket extends BasePacket implements IRemoveTank {
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
    return `RemoveTankPacket(nickname=${this.nickname})`;
  }

  static getId(): number {
    return 1719707347;
  }
}
