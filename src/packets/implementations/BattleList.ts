import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IBattleList } from "../interfaces/IBattleList";
import { BasePacket } from "./BasePacket";

export default class BattleList extends BasePacket implements IBattleList {
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
    return `BattleList()`;
  }

  static getId(): number {
    return 552006706;
  }
}
