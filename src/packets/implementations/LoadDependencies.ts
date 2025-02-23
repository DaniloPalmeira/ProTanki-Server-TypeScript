import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { ILoadDependencies } from "../interfaces/ILoadDependencies";

export default class LoadDependencies implements ILoadDependencies {
  dependencies: object;
  callbackId: number;

  constructor(dependencies: object, callbackId: number) {
    this.dependencies = dependencies;
    this.callbackId = callbackId;
  }

  read(buffer: Buffer): void {
    const isEmpty = buffer.readInt8(0) === 1;
    this.dependencies = {};
    if (!isEmpty) {
      const length = buffer.readInt32BE(1);
      this.dependencies = JSON.parse(buffer.toString("utf8", 5, 5 + length));
      this.callbackId = buffer.readInt32BE(5 + length);
    }
  }

  write(): Buffer {
    const isEmpty = Object.keys(this.dependencies).length === 0;
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

  run(server: ProTankiServer, client: ProTankiClient): void {}

  toString(): string {
    return `LoadDependencies: ${this.dependencies} ${this.callbackId}`;
  }

  getId(): number {
    return -1797047325;
  }
}
