import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IRotateTurretPacket, IRotateTurretPacketData } from "../interfaces/IRotateTurret";
import { BasePacket } from "./BasePacket";

export default class TurretRotationPacket extends BasePacket implements IRotateTurretPacket {
  public nickname: string | null;
  public angle: number;
  public control: number;

  constructor(data: IRotateTurretPacketData) {
    super();
    this.nickname = data.nickname;
    this.angle = data.angle;
    this.control = data.control;
  }

  public read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  public write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.nickname);
    writer.writeFloatBE(this.angle);
    writer.writeInt8(this.control);
    return writer.getBuffer();
  }

  public toString(): string {
    return `TurretRotationPacket(nickname=${this.nickname}, angle=${this.angle}, control=${this.control})`;
  }

  public static getId(): number {
    return 1927704181;
  }
}
