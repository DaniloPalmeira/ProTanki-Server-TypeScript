import { IGetUserInfo } from "../interfaces/IGetUserInfo";
import { BasePacket } from "./BasePacket";

export default class GetUserInfo extends BasePacket implements IGetUserInfo {
  nickname: string = "";

  read(buffer: Buffer): void {
    const isEmpty = buffer.readInt8(0) === 1;
    if (!isEmpty) {
      const length = buffer.readInt32BE(1);
      this.nickname = buffer.toString("utf8", 5, 5 + length);
    }
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
