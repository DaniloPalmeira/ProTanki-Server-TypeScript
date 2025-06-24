import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IEmpty } from "../interfaces/IEmpty";
import { BasePacket } from "./BasePacket";

export default class InviteCodeRegister extends BasePacket implements IEmpty {

  read(buffer: Buffer): void {}

  write(): Buffer {
    const packet = Buffer.alloc(0);

    return packet;
  }

  toString(): string {
    return `InviteCodeRegister()`;
  }

  static getId(): number {
    return 184934482;
  }
}
