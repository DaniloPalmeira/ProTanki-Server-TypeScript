import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IEmpty } from "../interfaces/IEmpty";
import { BasePacket } from "./BasePacket";

export default class NicknameAvailable extends BasePacket implements IEmpty {
  read(buffer: Buffer): void {}

  write(): Buffer {
    const packet = Buffer.alloc(0);

    return packet;
  }

  toString(): string {
    return `NicknameAvailable()`;
  }

  static getId(): number {
    return -706679202;
  }
}
