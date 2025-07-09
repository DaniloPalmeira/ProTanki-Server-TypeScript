import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IStartChargingPacket, IStartChargingPacketData } from "../interfaces/IStartCharging";
import { BasePacket } from "./BasePacket";

export default class StartChargingPacket extends BasePacket implements IStartChargingPacket {
  public nickname: string | null;

  constructor(data?: IStartChargingPacketData) {
    super();
    this.nickname = data?.nickname ?? null;
  }

  public read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.nickname = reader.readOptionalString();
  }

  public write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.nickname);
    return writer.getBuffer();
  }

  public toString(): string {
    return `StartChargingPacket(nickname=${this.nickname})`;
  }

  public static getId(): number {
    return 346830254;
  }
}
