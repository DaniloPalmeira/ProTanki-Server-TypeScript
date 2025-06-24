import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ISetLayout } from "../interfaces/ISetLayout";
import { BasePacket } from "./BasePacket";

export default class SetLayout extends BasePacket implements ISetLayout {
  layoutId: number;

  constructor(layoutId: number) {
    super();
    this.layoutId = layoutId;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.layoutId = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.layoutId);
    return writer.getBuffer();
  }

  toString(): string {
    return `SetLayout(layoutId=${this.layoutId})`;
  }

  static getId(): number {
    return 1118835050;
  }
}
