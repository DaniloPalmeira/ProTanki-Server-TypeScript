import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IRequestQuestsWindow } from "../interfaces/IRequestQuestsWindow";

export default class RequestQuestsWindow extends BasePacket implements IRequestQuestsWindow {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return `RequestQuestsWindow()`;
  }

  static getId(): number {
    return 1227293080;
  }
}
