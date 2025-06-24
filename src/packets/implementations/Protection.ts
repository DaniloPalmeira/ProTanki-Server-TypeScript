import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IProtection } from "../interfaces/IProtection";
import { BasePacket } from "./BasePacket";

export default class Protection extends BasePacket implements IProtection {
  keys: Array<number>;

  constructor(keys: Array<number>) {
    super();
    this.keys = keys;
  }

  read(buffer: Buffer): void {
    const length = buffer.readInt32BE(0);
    this.keys = [];
    for (let i = 0; i < length; i++) {
      this.keys.push(buffer.readInt8(4 + i));
    }
  }

  write(): Buffer {
    const packet = Buffer.alloc(4 + this.keys.length);
    packet.writeInt32BE(this.keys.length, 0);
    this.keys.forEach((val, index) => {
      packet.writeInt8(val, 4 + index);
    });

    return packet;
  }

  toString(): string {
    return `Protection(keys=${this.keys})`;
  }

  static getId(): number {
    return 2001736388;
  }
}
