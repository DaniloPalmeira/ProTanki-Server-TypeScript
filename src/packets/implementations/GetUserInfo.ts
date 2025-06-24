import { BufferReader } from "../../utils/buffer/BufferReader";
import { IGetUserInfo } from "../interfaces/IGetUserInfo";
import { BasePacket } from "./BasePacket";

export default class GetUserInfo extends BasePacket implements IGetUserInfo {
  nickname: string = "";

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.nickname = reader.readOptionalString() ?? "";
  }

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `GetUserInfo(nickname=${this.nickname})`;
  }

  static getId(): number {
    return 1774907609;
  }
}
