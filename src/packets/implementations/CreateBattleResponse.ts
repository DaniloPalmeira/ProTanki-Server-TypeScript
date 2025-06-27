import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ICreateBattleResponse } from "../interfaces/ICreateBattle";
import { BasePacket } from "./BasePacket";

export default class CreateBattleResponse extends BasePacket implements ICreateBattleResponse {
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
    return `CreateBattleResponse()`;
  }

  static getId(): number {
    return 802300608;
  }
}
