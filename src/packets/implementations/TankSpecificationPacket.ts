import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ITankSpecification, ITankSpecificationData } from "../interfaces/ITankSpecification";
import { BasePacket } from "./BasePacket";

export default class TankSpecificationPacket extends BasePacket implements ITankSpecification {
  nickname: string | null;
  speed: number;
  maxTurnSpeed: number;
  turretTurnSpeed: number;
  acceleration: number;
  isPro: boolean;

  constructor(data?: ITankSpecificationData) {
    super();
    this.nickname = data?.nickname ?? null;
    this.speed = data?.speed ?? 0;
    this.maxTurnSpeed = data?.maxTurnSpeed ?? 0;
    this.turretTurnSpeed = data?.turretTurnSpeed ?? 0;
    this.acceleration = data?.acceleration ?? 0;
    this.isPro = data?.isPro ?? false;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.nickname = reader.readOptionalString();
    this.speed = reader.readFloatBE();
    this.maxTurnSpeed = reader.readFloatBE();
    this.turretTurnSpeed = reader.readFloatBE();
    this.acceleration = reader.readFloatBE();
    this.isPro = reader.readInt16BE() === 1;
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.nickname);
    writer.writeFloatBE(this.speed);
    writer.writeFloatBE(this.maxTurnSpeed);
    writer.writeFloatBE(this.turretTurnSpeed);
    writer.writeFloatBE(this.acceleration);
    writer.writeInt16BE(this.isPro ? 1 : 0);
    return writer.getBuffer();
  }

  toString(): string {
    return `TankSpecificationPacket(\n` + `  nickname=${this.nickname},\n` + `  speed=${this.speed},\n` + `  maxTurnSpeed=${this.maxTurnSpeed},\n` + `  turretTurnSpeed=${this.turretTurnSpeed},\n` + `  acceleration=${this.acceleration},\n` + `  isPro=${this.isPro}\n` + `)`;
  }

  static getId(): number {
    return -1672577397;
  }
}
