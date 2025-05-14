import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IEmpty } from "../interfaces/IEmpty";
import { BasePacket } from "./BasePacket";
import Ping from "./Ping";

export default class Pong extends BasePacket implements IEmpty {
  read(buffer: Buffer): void {}

  write(): Buffer {
    const packet = Buffer.alloc(0);

    return packet;
  }

  run(server: ProTankiServer, client: ProTankiClient): void {
    setTimeout(() => {
      client.sendPacket(new Ping());
    }, 10000);
  }

  toString(): string {
    return `Pong()`;
  }

  getId(): number {
    return 1484572481;
  }
}
