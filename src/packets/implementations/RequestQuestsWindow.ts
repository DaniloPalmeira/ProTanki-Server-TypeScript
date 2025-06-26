import { BasePacket } from "./BasePacket";
import { IRequestQuestsWindow } from "../interfaces/IRequestQuestsWindow";

export default class RequestQuestsWindow extends BasePacket implements IRequestQuestsWindow {
  read(buffer: Buffer): void {}

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `RequestQuestsWindow()`;
  }

  static getId(): number {
    return 1227293080;
  }
}
