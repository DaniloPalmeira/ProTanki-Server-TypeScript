import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IDestroyTankPacket } from "../interfaces/IDestroyTankPacket";
import { BasePacket } from "./BasePacket";

export default class DestroyTankPacket extends BasePacket implements IDestroyTankPacket {
  nickname: string | null;
  readyToSpawnInMs: number;

  constructor(nickname: string | null = null, readyToSpawnInMs: number = 0) {
    super();
    this.nickname = nickname;
    this.readyToSpawnInMs = readyToSpawnInMs;
  }

  public read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.nickname = reader.readOptionalString();
    this.readyToSpawnInMs = reader.readInt32BE();
  }

  public write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.nickname);
    writer.writeInt32BE(this.readyToSpawnInMs);
    return writer.getBuffer();
  }

  public toString(): string {
    return `DestroyTankPacket(nickname=${this.nickname}, readyToSpawnInMs=${this.readyToSpawnInMs})`;
  }

  public static getId(): number {
    return 162656882;
  }
}
