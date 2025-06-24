import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IRegistration } from "../interfaces/IRegistration";
import { BasePacket } from "./BasePacket";

export default class Registration extends BasePacket implements IRegistration {
  bgResource: number;
  enableRequiredEmail: boolean;
  maxPasswordLength: number;
  minPasswordLength: number;

  constructor(bgResource: number = 0, enableRequiredEmail: boolean = false, maxPasswordLength: number = 0, minPasswordLength: number = 0) {
    super();
    this.bgResource = bgResource;
    this.enableRequiredEmail = enableRequiredEmail;
    this.maxPasswordLength = maxPasswordLength;
    this.minPasswordLength = minPasswordLength;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.bgResource = reader.readInt32BE();
    this.enableRequiredEmail = reader.readUInt8() === 1;
    this.maxPasswordLength = reader.readInt32BE();
    this.minPasswordLength = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.bgResource);
    writer.writeUInt8(this.enableRequiredEmail ? 1 : 0);
    writer.writeInt32BE(this.maxPasswordLength);
    writer.writeInt32BE(this.minPasswordLength);
    return writer.getBuffer();
  }

  toString(): string {
    return `Registration(bgResource=${this.bgResource}, enableRequiredEmail=${this.enableRequiredEmail}, maxPasswordLength=${this.maxPasswordLength}, minPasswordLength=${this.minPasswordLength})`;
  }

  static getId(): number {
    return -1277343167;
  }
}
