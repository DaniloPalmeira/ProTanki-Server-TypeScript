import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IReadyToSpawn } from "../interfaces/IReadyToSpawn";
import { BasePacket } from "./BasePacket";

export default class ReadyToSpawnPacket extends BasePacket implements IReadyToSpawn {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return "ReadyToSpawnPacket()";
  }

  static getId(): number {
    return 268832557;
  }
}
