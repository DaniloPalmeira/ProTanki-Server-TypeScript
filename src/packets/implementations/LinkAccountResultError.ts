import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { ILinkAccountResultError } from "../interfaces/ILinkAccountResultError";

export default class LinkAccountResultError extends BasePacket implements ILinkAccountResultError {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return `LinkAccountResultError()`;
  }

  static getId(): number {
    return -541741971;
  }
}
