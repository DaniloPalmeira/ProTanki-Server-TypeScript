import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IBattleInfo } from "../interfaces/IBattleInfo";
import { BasePacket } from "./BasePacket";

export default class BattleInfo extends BasePacket implements IBattleInfo {
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
    return `BattleInfo()`;
  }

  static getId(): number {
    return -838186985;
  }
}
