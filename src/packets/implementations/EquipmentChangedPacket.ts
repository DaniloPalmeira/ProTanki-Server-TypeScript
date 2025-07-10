import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IEquipmentChanged } from "../interfaces/IEquipmentChanged";
import { BasePacket } from "./BasePacket";

export default class EquipmentChangedPacket extends BasePacket implements IEquipmentChanged {
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
    return `EquipmentChangedPacket(nickname=${this.nickname})`;
  }

  static getId(): number {
    return -1767633906;
  }
}
