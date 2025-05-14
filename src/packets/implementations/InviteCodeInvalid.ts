import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IEmpty } from "../interfaces/IEmpty";
import { BasePacket } from "./BasePacket";

export default class InviteCodeInvalid extends BasePacket implements IEmpty {
  read(buffer: Buffer): void {
    this.readEmpty(buffer);
  }

  write(): Buffer {
    return this.writeEmpty();
  }

  toString(): string {
    return `InviteCodeInvalid()`;
  }

  getId(): number {
    return 312571157;
  }
}
