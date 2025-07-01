import { IReadyToActivate } from "../interfaces/IReadyToActivate";
import { BasePacket } from "./BasePacket";

export default class ReadyToActivatePacket extends BasePacket implements IReadyToActivate {
  read(buffer: Buffer): void {}

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return "ReadyToActivatePacket()";
  }

  static getId(): number {
    return 1178028365;
  }
}
