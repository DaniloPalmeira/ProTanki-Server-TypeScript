import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IVector3 } from "../interfaces/geom/IVector3";
import { ISmokyTargetShotPacket } from "../interfaces/ISmokyShot";
import { BasePacket } from "./BasePacket";

export default class SmokyTargetShotPacket extends BasePacket implements ISmokyTargetShotPacket {
  public nickname: string | null;
  public targetNickname: string | null;
  public hitPosition: IVector3 | null;
  public impactForce: number;
  public critical: boolean;

  constructor(data?: Partial<ISmokyTargetShotPacket>) {
    super();
    this.nickname = data?.nickname ?? null;
    this.targetNickname = data?.targetNickname ?? null;
    this.hitPosition = data?.hitPosition ?? null;
    this.impactForce = data?.impactForce ?? 0;
    this.critical = data?.critical ?? false;
  }

  public read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.nickname = reader.readOptionalString();
    this.targetNickname = reader.readOptionalString();
    this.hitPosition = reader.readOptionalVector3();
    this.impactForce = reader.readFloatBE();
    this.critical = reader.readUInt8() === 1;
  }

  public write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.nickname);
    writer.writeOptionalString(this.targetNickname);
    writer.writeOptionalVector3(this.hitPosition);
    writer.writeFloatBE(this.impactForce);
    writer.writeUInt8(this.critical ? 1 : 0);
    return writer.getBuffer();
  }

  public toString(): string {
    return `SmokyTargetShotPacket(\n` + `  nickname=${this.nickname},\n` + `  targetNickname=${this.targetNickname},\n` + `  hitPosition=${JSON.stringify(this.hitPosition)},\n` + `  impactForce=${this.impactForce},\n` + `  critical=${this.critical}\n` + `)`;
  }

  public static getId(): number {
    return -1334002026;
  }
}
