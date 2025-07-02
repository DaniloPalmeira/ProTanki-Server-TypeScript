import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
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
    const writer = new BufferWriter();
    writer.writeInt32BE(this.clientTime);
    writer.writeFloatBE(this.angle);
    writer.writeInt8(this.control);
    writer.writeInt16BE(this.incarnation);
    return writer.getBuffer();
  }

  public toString(): string {
    return `RotateTurretCommandPacket(\n` + `  clientTime=${this.clientTime},\n` + `  angle=${this.angle},\n` + `  control=${this.control},\n` + `  incarnation=${this.incarnation}\n` + `)`;
  }

  public static getId(): number {
    return -114968993;
  }
}
