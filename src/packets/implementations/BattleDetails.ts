import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IBattleDetails } from "../interfaces/IBattleDetails";
import { BasePacket } from "./BasePacket";

export default class BattleDetails extends BasePacket implements IBattleDetails {
  jsonData: string | null;

  constructor(jsonData: string | null) {
    super();
    this.jsonData = jsonData;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.jsonData);
    return writer.getBuffer();
  }

  toString(): string {
    return `BattleDetails()`;
  }

  static getId(): number {
    return 546722394;
  }
}
