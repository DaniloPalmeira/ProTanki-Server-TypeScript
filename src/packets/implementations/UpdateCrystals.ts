import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IUpdateCrystals } from "../interfaces/IUpdateCrystals";

export default class UpdateCrystals extends BasePacket implements IUpdateCrystals {
  crystals: number = 0;

  constructor(crystals?: number) {
    super();
    if (crystals !== undefined) {
      this.crystals = crystals;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.crystals = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.crystals);
    return writer.getBuffer();
  }

  toString(): string {
    return `UpdateCrystals(crystals=${this.crystals})`;
  }

  static getId(): number {
    return -593513288;
  }
}
