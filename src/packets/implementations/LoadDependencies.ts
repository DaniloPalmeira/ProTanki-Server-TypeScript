import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import {
  ILoadDependencies,
  IDependency,
} from "../interfaces/ILoadDependencies";
import { BasePacket } from "./BasePacket";

export default class LoadDependencies
  extends BasePacket
  implements ILoadDependencies
{
  dependencies: { resources: IDependency[] };
  callbackId: number;

  constructor(dependencies: { resources: IDependency[] }, callbackId: number) {
    super();
    this.dependencies = dependencies;
    this.callbackId = callbackId;
  }

  /**
   * Reads the dependencies and callback ID from the buffer.
   * @param buffer - The buffer to read from.
   */
  read(buffer: Buffer): void {
    const isEmpty = buffer.readInt8(0) === 1;
    this.dependencies = { resources: [] };
    if (!isEmpty) {
      const length = buffer.readInt32BE(1);
      this.dependencies = JSON.parse(buffer.toString("utf8", 5, 5 + length));
      this.callbackId = buffer.readInt32BE(5 + length);
    }
  }

  /**
   * Writes the dependencies and callback ID to a buffer.
   * @returns The encoded buffer.
   */
  write(): Buffer {
    const isEmpty = this.dependencies.resources.length === 0;
    const objString = JSON.stringify(this.dependencies);
    const packet = Buffer.alloc(isEmpty ? 1 : 1 + 4 + objString.length + 4);
    packet.writeInt8(isEmpty ? 1 : 0, 0);
    if (!isEmpty) {
      packet.writeInt32BE(objString.length, 1);
      packet.write(objString, 5);
      packet.writeInt32BE(this.callbackId, 5 + objString.length);
    }
    return packet;
  }

  toString(): string {
    return `LoadDependencies(callbackid=${
      this.callbackId
    }, dependencies=${JSON.stringify(this.dependencies)})`;
  }

  getId(): number {
    return -1797047325;
  }
}
