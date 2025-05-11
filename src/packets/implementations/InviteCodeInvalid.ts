import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IEmpty } from "../interfaces/IEmpty";

export default class InviteCodeInvalid implements IEmpty {
  constructor() {}

  read(buffer: Buffer): void {}

  write(): Buffer {
    const packet = Buffer.alloc(0);

    return packet;
  }

  run(server: ProTankiServer, client: ProTankiClient): void {}

  toString(): string {
    return `InviteCodeInvalid()`;
  }

  getId(): number {
    return 312571157;
  }
}
