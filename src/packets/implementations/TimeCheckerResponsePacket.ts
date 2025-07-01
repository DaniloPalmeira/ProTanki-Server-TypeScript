import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ITimeCheckerResponse } from "../interfaces/ITimeCheckerResponse";
import { BasePacket } from "./BasePacket";

export default class TimeCheckerResponsePacket extends BasePacket implements ITimeCheckerResponse {
  clientTime: number;
  serverTime: number;

  constructor(clientTime: number = 0, serverTime: number = 0) {
    super();
    this.clientTime = clientTime;
    this.serverTime = serverTime;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.clientTime = reader.readInt32BE();
    this.serverTime = reader.readInt32BE();
  }

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `TimeCheckerResponsePacket(clientTime=${this.clientTime}, serverTime=${this.serverTime})`;
  }

  static getId(): number {
    return 2074243318;
  }
}
