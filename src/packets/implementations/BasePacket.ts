import { IPacket } from "../interfaces/IPacket";
import { ProTankiServer } from "../../server/ProTankiServer";
import { ProTankiClient } from "../../server/ProTankiClient";

export abstract class BasePacket implements IPacket {
  abstract getId(): number;
  abstract read(buffer: Buffer): void;
  abstract write(): Buffer;
  abstract toString(): string;

  run(server: ProTankiServer, client: ProTankiClient): void | Promise<void> {}
}
