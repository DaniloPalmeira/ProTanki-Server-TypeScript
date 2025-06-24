import { IPacket } from "../interfaces/IPacket";
import { ProTankiServer } from "../../server/ProTankiServer";
import { ProTankiClient } from "../../server/ProTankiClient";

export abstract class BasePacket implements IPacket {
  abstract read(buffer: Buffer): void;
  abstract write(): Buffer;
  abstract toString(): string;

  static getId(): number {
    throw new Error("Method 'getId()' must be implemented.");
  }

  getId(): number {
    return (this.constructor as typeof BasePacket).getId();
  }
}
