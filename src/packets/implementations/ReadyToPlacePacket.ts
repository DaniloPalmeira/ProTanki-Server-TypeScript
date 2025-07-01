import { IReadyToPlace } from "../interfaces/IReadyToPlace";
import { BasePacket } from "./BasePacket";

export default class ReadyToPlacePacket extends BasePacket implements IReadyToPlace {
  read(buffer: Buffer): void {}

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return "ReadyToPlacePacket()";
  }

  static getId(): number {
    return -1378839846;
  }
}
