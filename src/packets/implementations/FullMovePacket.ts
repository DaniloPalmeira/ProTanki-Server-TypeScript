import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IFullMovePacket, IFullMovePacketData } from "../interfaces/IMove";
import { IVector3 } from "../interfaces/geom/IVector3";
import { BasePacket } from "./BasePacket";

export default class FullMovePacket extends BasePacket implements IFullMovePacket {
  public nickname: string | null;
  public angularVelocity: IVector3 | null;
  public control: number;
  public linearVelocity: IVector3 | null;
  public orientation: IVector3 | null;
  public position: IVector3 | null;
  public direction: number;

  constructor(data: IFullMovePacketData) {
    super();
    this.nickname = data.nickname;
    this.angularVelocity = data.angularVelocity;
    this.control = data.control;
    this.linearVelocity = data.linearVelocity;
    this.orientation = data.orientation;
    this.position = data.position;
    this.direction = data.direction;
  }

  public read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  public write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.nickname);
    writer.writeOptionalVector3(this.angularVelocity);
    writer.writeInt8(this.control);
    writer.writeOptionalVector3(this.linearVelocity);
    writer.writeOptionalVector3(this.orientation);
    writer.writeOptionalVector3(this.position);
    writer.writeFloatBE(this.direction);
    return writer.getBuffer();
  }

  public toString(): string {
    return `FullMovePacket(nickname=${this.nickname})`;
  }

  public static getId(): number {
    return 1516578027;
  }
}
