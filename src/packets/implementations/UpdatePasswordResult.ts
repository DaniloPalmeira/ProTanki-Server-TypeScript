import { IUpdatePasswordResult } from "../interfaces/IUpdatePasswordResult";
import { BasePacket } from "./BasePacket";

export default class UpdatePasswordResult extends BasePacket implements IUpdatePasswordResult {
  isError: boolean;
  message: string;

  constructor(isError: boolean = false, message: string = "") {
    super();
    this.isError = isError;
    this.message = message;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  write(): Buffer {
    const messageBuffer = Buffer.from(this.message, "utf8");
    const packet = Buffer.alloc(1 + 1 + 4 + messageBuffer.length);

    packet.writeInt8(this.isError ? 1 : 0, 0);

    const isMessageEmpty = this.message.length === 0;
    packet.writeInt8(isMessageEmpty ? 1 : 0, 1);

    if (!isMessageEmpty) {
      packet.writeInt32BE(messageBuffer.length, 2);
      messageBuffer.copy(packet, 6);
    }

    return packet;
  }

  toString(): string {
    return `UpdatePasswordResult(isError=${this.isError}, message=${this.message})`;
  }

  static getId(): number {
    return 1570555748;
  }
}
