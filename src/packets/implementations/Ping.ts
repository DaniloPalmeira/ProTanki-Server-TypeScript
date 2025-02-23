import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPing } from "../interfaces/IPing";

export default class Ping implements IPing {
  constructor() {}

  read(buffer: Buffer): void {}

  write(): Buffer {
    const packet = Buffer.alloc(0);

    return packet;
  }

  run(server: ProTankiServer, client: ProTankiClient): void {}

  toString(): string {
    return `Ping()`;
  }

  getId(): number {
    return -555602629;
  }
}
