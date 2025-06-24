import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IEmpty } from "../interfaces/IEmpty";
import { BasePacket } from "./BasePacket";

export default class HideLoader extends BasePacket implements IEmpty {
  constructor() {
    super();
  }

  read(buffer: Buffer): void {}

  write(): Buffer {
    const packet = Buffer.alloc(0);

    return packet;
  }

  toString(): string {
    return `HideLoader()`;
  }

  static getId(): number {
    return -1282173466;
  }
}
