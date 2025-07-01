import { BufferReader } from "../../utils/buffer/BufferReader";
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
    throw new Error("Method not implemented.");
  }

  public toString(): string {
    return `MoveCommandPacket(clientTime=${this.clientTime}, incarnation=${this.incarnation})`;
  }

  public static getId(): number {
    return 329279865;
  }
}
