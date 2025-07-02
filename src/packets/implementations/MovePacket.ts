import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IMovePacket, IMovePacketData } from "../interfaces/IMove";
import { IVector3 } from "../interfaces/geom/IVector3";
import { BasePacket } from "./BasePacket";

export default class MovePacket extends BasePacket implements IMovePacket {
  public nickname: string | null;
  public angularVelocity: IVector3 | null;
  public control: number;
  public linearVelocity: IVector3 | null;
  public orientation: IVector3 | null;
  public position: IVector3 | null;

  constructor(data: IMovePacketData) {
    super();
    this.nickname = data.nickname;
    this.angularVelocity = data.angularVelocity;
    this.control = data.control;
    this.linearVelocity = data.linearVelocity;
    this.orientation = data.orientation;
    this.position = data.position;
  }

  public read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.nickname = reader.readOptionalString();
    this.angularVelocity = reader.readOptionalVector3();
    this.control = reader.readInt8();
    this.linearVelocity = reader.readOptionalVector3();
    this.orientation = reader.readOptionalVector3();
    this.position = reader.readOptionalVector3();
  }

  public write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.nickname);
    writer.writeOptionalVector3(this.angularVelocity);
    writer.writeInt8(this.control);
    writer.writeOptionalVector3(this.linearVelocity);
    writer.writeOptionalVector3(this.orientation);
    writer.writeOptionalVector3(this.position);
    return writer.getBuffer();
  }

  public toString(): string {
    return `MovePacket(\n` + `  nickname=${this.nickname},\n` + `  angularVelocity=${JSON.stringify(this.angularVelocity)},\n` + `  control=${this.control},\n` + `  linearVelocity=${JSON.stringify(this.linearVelocity)},\n` + `  orientation=${JSON.stringify(this.orientation)},\n` + `  position=${JSON.stringify(this.position)}\n` + `)`;
  }

  public static getId(): number {
    return -64696933;
  }
}
