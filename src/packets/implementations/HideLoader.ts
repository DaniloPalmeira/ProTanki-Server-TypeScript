import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IHideLoader } from "../interfaces/IHideLoader";

export default class HideLoader implements IHideLoader {
  constructor() {}

  read(buffer: Buffer): void {}

  write(): Buffer {
    const packet = Buffer.alloc(0);

    return packet;
  }

  run(server: ProTankiServer, client: ProTankiClient): void {}

  toString(): string {
    return `HideLoader()`;
  }

  getId(): number {
    return -1282173466;
  }
}
