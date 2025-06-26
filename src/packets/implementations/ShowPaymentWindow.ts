import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IShowPaymentWindow } from "../interfaces/IShowPaymentWindow";

export default class ShowPaymentWindow extends BasePacket implements IShowPaymentWindow {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return `ShowPaymentWindow()`;
  }

  static getId(): number {
    return 1870342869;
  }
}
