import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";

export interface IPacket {
  [x: string]: any;
  read(buffer: Buffer): void;
  write(): Buffer;
  run(server: ProTankiServer, client: ProTankiClient): void;
  toString(): string;
  getId(): number;
}
