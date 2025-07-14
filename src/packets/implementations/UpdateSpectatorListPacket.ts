import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IUpdateSpectatorList } from "../interfaces/IUpdateSpectatorList";
import { BasePacket } from "./BasePacket";

export default class UpdateSpectatorListPacket extends BasePacket implements IUpdateSpectatorList {
  spectatorList: string | null;

  constructor(spectatorList: string | null = null) {
    super();
    this.spectatorList = spectatorList;
  }

  public read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.spectatorList = reader.readOptionalString();
  }

  public write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.spectatorList);
    return writer.getBuffer();
  }

  public toString(): string {
    const list = this.spectatorList?.replace(/\n/g, ", ") || "";
    return `UpdateSpectatorListPacket(spectators=[${list}])`;
  }

  public static getId(): number {
    return -1331361684;
  }
}
