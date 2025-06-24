import { IResourceCallback } from "../interfaces/IResourceCallback";
import { BasePacket } from "./BasePacket";

export default class ResourceCallback extends BasePacket implements IResourceCallback {
  callbackId: number;

  constructor(callbackId: number = 0) {
    super();
    this.callbackId = callbackId;
  }

  read(buffer: Buffer): void {
    this.callbackId = buffer.readInt32BE(0);
  }

  write(): Buffer {
    const packet = Buffer.alloc(4);
    packet.writeInt32BE(this.callbackId, 0);
    return packet;
  }

  toString(): string {
    return `ResourceCallback(callbackId=${this.callbackId})`;
  }

  static getId(): number {
    return -82304134;
  }
}
