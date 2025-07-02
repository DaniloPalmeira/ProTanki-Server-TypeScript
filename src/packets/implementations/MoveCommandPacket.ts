import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IMoveCommand } from "../interfaces/IMove";
import { IVector3 } from "../interfaces/geom/IVector3";
import { BasePacket } from "./BasePacket";

export default class MoveCommandPacket extends BasePacket implements IMoveCommand {
  public clientTime: number = 0;
  public incarnation: number = 0;
  public angularVelocity: IVector3 | null = null;
  public control: number = 0;
  public linearVelocity: IVector3 | null = null;
  public orientation: IVector3 | null = null;
  public position: IVector3 | null = null;

  public read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.clientTime = reader.readInt32BE();
    this.incarnation = reader.readInt16BE();
    this.angularVelocity = reader.readOptionalVector3();
    this.control = reader.readInt8();
    this.linearVelocity = reader.readOptionalVector3();
    this.orientation = reader.readOptionalVector3();
    this.position = reader.readOptionalVector3();
  }

  public write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.clientTime);
    writer.writeInt16BE(this.incarnation);
    writer.writeOptionalVector3(this.angularVelocity);
    writer.writeInt8(this.control);
    writer.writeOptionalVector3(this.linearVelocity);
    writer.writeOptionalVector3(this.orientation);
    writer.writeOptionalVector3(this.position);
    return writer.getBuffer();
  }

  public toString(): string {
    return `MoveCommandPacket(\n` + `  clientTime=${this.clientTime},\n` + `  incarnation=${this.incarnation},\n` + `  angularVelocity=${JSON.stringify(this.angularVelocity)},\n` + `  control=${this.control},\n` + `  linearVelocity=${JSON.stringify(this.linearVelocity)},\n` + `  orientation=${JSON.stringify(this.orientation)},\n` + `  position=${JSON.stringify(this.position)}\n` + `)`;
  }

  public static getId(): number {
    return 329279865;
  }
}
