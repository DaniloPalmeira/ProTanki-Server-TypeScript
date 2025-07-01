import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ISpawn, ISpawnData } from "../interfaces/ISpawn";
import { IVector3 } from "../interfaces/geom/IVector3";
import { BasePacket } from "./BasePacket";

export default class SpawnPacket extends BasePacket implements ISpawn {
  nickname: string | null;
  team: number;
  position: IVector3 | null;
  orientation: IVector3 | null;
  health: number;
  incarnation: number;

  constructor(data?: ISpawnData) {
    super();
    this.nickname = data?.nickname ?? null;
    this.team = data?.team ?? 2;
    this.position = data?.position ?? null;
    this.orientation = data?.orientation ?? null;
    this.health = data?.health ?? 0;
    this.incarnation = data?.incarnation ?? 0;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.nickname = reader.readOptionalString();
    this.team = reader.readInt32BE();
    this.position = reader.readOptionalVector3();
    this.orientation = reader.readOptionalVector3();
    this.health = reader.readInt16BE();
    this.incarnation = reader.readInt16BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.nickname);
    writer.writeInt32BE(this.team);
    writer.writeOptionalVector3(this.position);
    writer.writeOptionalVector3(this.orientation);
    writer.writeInt16BE(this.health);
    writer.writeInt16BE(this.incarnation);
    return writer.getBuffer();
  }

  toString(): string {
    return `SpawnPacket(nickname=${this.nickname}, team=${this.team}, health=${this.health})`;
  }

  static getId(): number {
    return 875259457;
  }
}
