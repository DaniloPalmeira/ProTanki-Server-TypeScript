import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IEmpty } from "../interfaces/IEmpty";

export default class InviteCodeRegister implements IEmpty {
  constructor() {}

  read(buffer: Buffer): void {}

  write(): Buffer {
    const packet = Buffer.alloc(0);

    return packet;
  }

  run(server: ProTankiServer, client: ProTankiClient): void {}

  toString(): string {
    return `InviteCodeRegister()`;
  }

  getId(): number {
    return 184934482;
  }
}
