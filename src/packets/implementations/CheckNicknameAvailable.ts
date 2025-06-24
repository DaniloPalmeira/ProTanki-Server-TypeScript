import { ICheckNicknameAvailable } from "../interfaces/ICheckNicknameAvailable";
import { BasePacket } from "./BasePacket";

export default class CheckNicknameAvailable extends BasePacket implements ICheckNicknameAvailable {
  nickname: string;

  constructor(nickname: string = "") {
    super();
    this.nickname = nickname;
  }

  read(buffer: Buffer): void {
    const isEmpty = buffer.readInt8(0) === 1;
    if (isEmpty) {
      this.nickname = "";
      return;
    }
    const length = buffer.readInt32BE(1);
    this.nickname = buffer.toString("utf8", 5, 5 + length);
  }

  write(): Buffer {
    if (this.nickname.length == 0) {
      return Buffer.from([1]);
    }
    const stringBuffer = Buffer.from(this.nickname, "utf8");
    const packetSize = 5 + stringBuffer.length;
    const buffer = Buffer.alloc(packetSize);
    buffer.writeInt8(0, 0);
    buffer.writeInt32BE(stringBuffer.length, 1);
    stringBuffer.copy(buffer, 5);

    return buffer;
  }

  toString(): string {
    return `CheckNicknameAvailable(nickname=${this.nickname})`;
  }

  static getId(): number {
    return 1083705823;
  }
}
