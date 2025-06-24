import { ISystemMessage } from "../interfaces/ISystemMessage";
import { BasePacket } from "./BasePacket";

export default class SystemMessage extends BasePacket implements ISystemMessage {
  text: string;

  constructor(text: string = "") {
    super();
    this.text = text;
  }

  read(buffer: Buffer): void {
    const isEmpty = buffer.readInt8(0) === 1;
    if (!isEmpty) {
      const length = buffer.readInt32BE(1);
      this.text = buffer.toString("utf8", 5, 5 + length);
    }
  }

  write(): Buffer {
    const isEmpty = this.text.length === 0;
    if (isEmpty) {
      return Buffer.from([1]);
    }

    const stringBuffer = Buffer.from(this.text, "utf8");
    const packet = Buffer.alloc(1 + 4 + stringBuffer.length);

    packet.writeInt8(0, 0);
    packet.writeInt32BE(stringBuffer.length, 1);
    stringBuffer.copy(packet, 5);

    return packet;
  }

  toString(): string {
    return `SystemMessage(text=${this.text})`;
  }

  static getId(): number {
    return -600078553;
  }
}
