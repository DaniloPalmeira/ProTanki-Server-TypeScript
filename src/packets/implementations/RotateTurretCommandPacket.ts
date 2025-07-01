import { BufferReader } from "../../utils/buffer/BufferReader";
import { IRotateTurretCommand } from "../interfaces/IRotateTurret";
import { BasePacket } from "./BasePacket";

export default class RotateTurretCommandPacket extends BasePacket implements IRotateTurretCommand {
  public clientTime: number = 0;
  public angle: number = 0;
  public control: number = 0;
  public incarnation: number = 0;

  public read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.clientTime = reader.readInt32BE();
    this.angle = reader.readFloatBE();
    this.control = reader.readInt8();
    this.incarnation = reader.readInt16BE();
  }

  public write(): Buffer {
    throw new Error("Method not implemented.");
  }

  public toString(): string {
    return `RotateTurretCommandPacket(angle=${this.angle}, control=${this.control})`;
  }

  public static getId(): number {
    return -114968993;
  }
}
