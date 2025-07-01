import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ISetHealth, ISetHealthData } from "../interfaces/ISetHealth";
import { BasePacket } from "./BasePacket";

export default class SetHealthPacket extends BasePacket implements ISetHealth {
  nickname: string | null;
  health: number;

  constructor(data?: ISetHealthData) {
    super();
    this.nickname = data?.nickname ?? null;
    this.health = data?.health ?? 0;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.nickname = reader.readOptionalString();
    this.health = reader.readFloatBE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.nickname);
    writer.writeFloatBE(this.health);
    return writer.getBuffer();
  }

  toString(): string {
    return `SetHealthPacket(nickname=${this.nickname}, health=${this.health})`;
  }

  static getId(): number {
    return -611961116;
  }
}
