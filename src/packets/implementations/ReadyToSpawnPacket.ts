import { IReadyToSpawn } from "../interfaces/IReadyToSpawn";
import { BasePacket } from "./BasePacket";

export default class ReadyToSpawnPacket extends BasePacket implements IReadyToSpawn {
  read(buffer: Buffer): void {}

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return "ReadyToSpawnPacket()";
  }

  static getId(): number {
    return 268832557;
  }
}
