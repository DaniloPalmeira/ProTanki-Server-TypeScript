import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ISetLoadingScreenImage } from "../interfaces/ISetLoadingScreenImage";
import { BasePacket } from "./BasePacket";

export default class SetLoadingScreenImagePacket extends BasePacket implements ISetLoadingScreenImage {
  resourceImageIdLow: number = 0;

  constructor(resourceImageIdLow?: number) {
    super();
    if (resourceImageIdLow !== undefined) {
      this.resourceImageIdLow = resourceImageIdLow;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.resourceImageIdLow = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.resourceImageIdLow);
    return writer.getBuffer();
  }

  toString(): string {
    return `SetLoadingScreenImagePacket(resourceImageIdLow=${this.resourceImageIdLow})`;
  }

  static getId(): number {
    return 2094741924;
  }
}
