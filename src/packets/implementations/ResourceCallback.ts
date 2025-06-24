import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IResourceCallback } from "../interfaces/IResourceCallback";
import { BasePacket } from "./BasePacket";

export default class ResourceCallback extends BasePacket implements IResourceCallback {
  callbackId: number;

  constructor(callbackId: number = 0) {
    super();
    this.callbackId = callbackId;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.callbackId = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.callbackId);
    return writer.getBuffer();
  }

  toString(): string {
    return `ResourceCallback(callbackId=${this.callbackId})`;
  }

  static getId(): number {
    return -82304134;
  }
}
