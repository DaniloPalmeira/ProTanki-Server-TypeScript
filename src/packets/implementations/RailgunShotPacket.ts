import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IVector3 } from "../interfaces/geom/IVector3";
import { IRailgunShotPacket, IRailgunShotPacketData } from "../interfaces/IRailgunShot";
import { BasePacket } from "./BasePacket";

export default class RailgunShotPacket extends BasePacket implements IRailgunShotPacket {
  public shooterNickname: string | null;
  public hitPosition: IVector3 | null;
  public targets: { nickname: string; position: IVector3 }[];

  constructor(data?: IRailgunShotPacketData) {
    super();
    this.shooterNickname = data?.shooterNickname ?? null;
    this.hitPosition = data?.hitPosition ?? null;
    this.targets = data?.targets ?? [];
  }

  public read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.shooterNickname = reader.readOptionalString();
    this.hitPosition = reader.readOptionalVector3();

    const targetNicknames = reader.readStringArray();
    const targetPositions = reader.readVector3Array();

    this.targets = [];
    for (let i = 0; i < targetNicknames.length; i++) {
      const position = targetPositions[i];
      if (position) {
        this.targets.push({
          nickname: targetNicknames[i],
          position: position,
        });
      }
    }
  }

  public write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.shooterNickname);
    writer.writeOptionalVector3(this.hitPosition);

    const nicknames = this.targets.map((t) => t.nickname);
    const positions = this.targets.map((t) => t.position);

    writer.writeOptionalStringArray(nicknames);
    writer.writeVector3Array(positions);

    return writer.getBuffer();
  }

  public toString(): string {
    return `RailgunShotPacket(shooter=${this.shooterNickname}, hitPosition=${JSON.stringify(this.hitPosition)}, targetsCount=${this.targets.length})`;
  }

  public static getId(): number {
    return -369590613;
  }
}
