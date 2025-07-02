import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IRequestPaymentWindow } from "../interfaces/IRequestPaymentWindow";

export default class RequestPaymentWindow extends BasePacket implements IRequestPaymentWindow {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return `RequestPaymentWindow()`;
  }

  static getId(): number {
    return -296048697;
  }
}
