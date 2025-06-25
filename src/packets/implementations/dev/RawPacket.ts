import { IPacket } from "../../interfaces/IPacket";
import { BasePacket } from "../BasePacket";

export default class RawPacket extends BasePacket implements IPacket {
  private id: number;
  private data: Buffer;

  constructor(id: number, data: Buffer) {
    super();
    this.id = id;
    this.data = data;
  }

  read(buffer: Buffer): void {
    throw new Error("RawPacket cannot be read.");
  }

  write(): Buffer {
    return this.data;
  }

  toString(): string {
    return `RawPacket(id=${this.id}, payload=${this.data.toString("hex")})`;
  }

  getId(): number {
    return this.id;
  }

  static getId(): number {
    throw new Error("RawPacket does not have a static ID. Use the instance's getId() method.");
  }
}
