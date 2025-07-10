import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IVector3 } from "../interfaces/geom/IVector3";
import { ISmokyStaticShotPacket } from "../interfaces/ISmokyShot";
import { BasePacket } from "./BasePacket";

export default class SmokyStaticShotPacket extends BasePacket implements ISmokyStaticShotPacket {
  public nickname: string | null;
  public hitPosition: IVector3 | null;

  constructor(nickname: string | null = null, hitPosition: IVector3 | null = null) {
    super();
    this.nickname = nickname;
    this.hitPosition = hitPosition;
  }

  public read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.nickname = reader.readOptionalString();
    this.hitPosition = reader.readOptionalVector3();
  }

  public write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.nickname);
    writer.writeOptionalVector3(this.hitPosition);
    return writer.getBuffer();
  }

  public toString(): string {
    return `SmokyStaticShotPacket(nickname=${this.nickname}, hitPosition=${JSON.stringify(this.hitPosition)})`;
  }

  public static getId(): number {
    return 546849203;
  }
}
