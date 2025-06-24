import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ILoadDependencies, IDependency } from "../interfaces/ILoadDependencies";
import { BasePacket } from "./BasePacket";

export default class LoadDependencies extends BasePacket implements ILoadDependencies {
  dependencies: { resources: IDependency[] };
  callbackId: number;

  constructor(dependencies: { resources: IDependency[] }, callbackId: number) {
    super();
    this.dependencies = dependencies;
    this.callbackId = callbackId;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    const jsonString = reader.readOptionalString();
    this.dependencies = jsonString ? JSON.parse(jsonString) : { resources: [] };
    this.callbackId = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    const jsonString = JSON.stringify(this.dependencies);
    writer.writeOptionalString(jsonString);
    writer.writeInt32BE(this.callbackId);
    return writer.getBuffer();
  }

  toString(): string {
    return `LoadDependencies(callbackid=${this.callbackId}, dependencies=${JSON.stringify(this.dependencies)})`;
  }

  static getId(): number {
    return -1797047325;
  }
}
