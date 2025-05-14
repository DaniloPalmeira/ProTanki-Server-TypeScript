import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IRegistration } from "../interfaces/IRegistration";
import { BasePacket } from "./BasePacket";

export default class Registration extends BasePacket implements IRegistration {
  bgResource: number;
  enableRequiredEmail: boolean;
  maxPasswordLength: number;
  minPasswordLengt: number;

  constructor(
    bgResource: number = 0,
    enableRequiredEmail: boolean = false,
    maxPasswordLength: number = 0,
    minPasswordLengt: number = 0
  ) {
    super();
    this.bgResource = bgResource;
    this.enableRequiredEmail = enableRequiredEmail;
    this.maxPasswordLength = maxPasswordLength;
    this.minPasswordLengt = minPasswordLengt;
  }

  read(buffer: Buffer): void {
    this.bgResource = buffer.readInt32BE(0);
    this.enableRequiredEmail = buffer.readInt8(4) === 1;
    this.maxPasswordLength = buffer.readInt32BE(5);
    this.minPasswordLengt = buffer.readInt32BE(9);
  }

  write(): Buffer {
    const packet = Buffer.alloc(13);
    packet.writeInt32BE(this.bgResource, 0);
    packet.writeInt8(this.enableRequiredEmail ? 1 : 0, 4);
    packet.writeInt32BE(this.maxPasswordLength, 5);
    packet.writeInt32BE(this.minPasswordLengt, 9);

    return packet;
  }

  toString(): string {
    return `Registration(bgResource=${this.bgResource}, enableRequiredEmail=${this.enableRequiredEmail}, maxPasswordLength=${this.maxPasswordLength}, minPasswordLengt=${this.minPasswordLengt})`;
  }

  getId(): number {
    return -1277343167;
  }
}
