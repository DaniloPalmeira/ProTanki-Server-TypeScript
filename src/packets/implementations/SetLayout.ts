import { ISetLayout } from "../interfaces/ISetLayout";
import { BasePacket } from "./BasePacket";

export default class SetLayout extends BasePacket implements ISetLayout {
  layoutId: number;

  constructor(layoutId: number) {
    super();
    this.layoutId = layoutId;
  }

  read(buffer: Buffer): void {
    this.layoutId = buffer.readInt32BE(0);
  }

  write(): Buffer {
    const packet = Buffer.alloc(4);
    packet.writeInt32BE(this.layoutId, 0);
    return packet;
  }

  toString(): string {
    return `SetLayout(layoutId=${this.layoutId})`;
  }

  static getId(): number {
    return 1118835050;
  }
}
