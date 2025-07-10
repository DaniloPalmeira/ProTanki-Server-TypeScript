import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IConfirmDestruction } from "../interfaces/IConfirmDestruction";
import { BasePacket } from "./BasePacket";

export default class ConfirmDestructionPacket extends BasePacket implements IConfirmDestruction {
  nickname: string | null;
  delaytoSpawn: number;

  constructor(nickname: string | null = null, delaytoSpawn: number = 0) {
    super();
    this.nickname = nickname;
    this.delaytoSpawn = delaytoSpawn;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.nickname = reader.readOptionalString();
    this.delaytoSpawn = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.nickname);
    writer.writeInt32BE(this.delaytoSpawn);
    return writer.getBuffer();
  }

  toString(): string {
    return `ConfirmDestructionPacket(nickname=${this.nickname}, delaytoSpawn=${this.delaytoSpawn})`;
  }

  static getId(): number {
    return -173682854;
  }
}
