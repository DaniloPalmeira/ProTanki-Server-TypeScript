import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IEmpty } from "../interfaces/IEmpty";
import { BasePacket } from "./BasePacket";

export default class HideLoader extends BasePacket implements IEmpty {
  constructor() {
    super();
  }

  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return `HideLoader()`;
  }

  static getId(): number {
    return -1282173466;
  }
}
