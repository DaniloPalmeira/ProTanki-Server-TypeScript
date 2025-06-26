import { BasePacket } from "./BasePacket";
import { IRequestPaymentWindow } from "../interfaces/IRequestPaymentWindow";

export default class RequestPaymentWindow extends BasePacket implements IRequestPaymentWindow {
  read(buffer: Buffer): void {}

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `RequestPaymentWindow()`;
  }

  static getId(): number {
    return -296048697;
  }
}
