import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { ICheckNicknameAvailable } from "../interfaces/ICheckNicknameAvailable";
import { BasePacket } from "./BasePacket";
import NicknameAvailable from "./NicknameAvailable";

export default class CheckNicknameAvailable
  extends BasePacket
  implements ICheckNicknameAvailable
{
  nickname: string;

  constructor(nickname: string = "") {
    super();
    this.nickname = nickname;
  }

  read(buffer: Buffer): void {
    const { value } = this.readString(buffer, 0);
    this.nickname = value;
  }

  write(): Buffer {
    return this.writeString(this.nickname);
  }

  run(server: ProTankiServer, client: ProTankiClient): void {
    if (this.nickname.toLowerCase() === "available") {
      client.sendPacket(new NicknameAvailable());
    }
  }

  toString(): string {
    return `CheckNicknameAvailable(nickname: ${this.nickname})`;
  }

  getId(): number {
    return 1083705823;
  }
}
