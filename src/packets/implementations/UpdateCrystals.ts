import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IUpdateCrystals } from "../interfaces/IUpdateCrystals";

export default class UpdateCrystals extends BasePacket implements IUpdateCrystals {
  crystals: number;

  constructor(crystals: number) {
    super();
    this.crystals = crystals;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
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
