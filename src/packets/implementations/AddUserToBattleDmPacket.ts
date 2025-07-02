import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IAddUserToBattleDm, IAddUserToBattleDmData } from "../interfaces/IAddUserToBattleDm";
import { BasePacket } from "./BasePacket";

export default class AddUserToBattleDmPacket extends BasePacket implements IAddUserToBattleDm {
  battleId: string | null;
  nickname: string | null;
  kills: number;
  score: number;
  suspicious: boolean;

  constructor(data?: IAddUserToBattleDmData) {
    super();
    this.battleId = data?.battleId ?? null;
    this.nickname = data?.nickname ?? null;
    this.kills = data?.kills ?? 0;
    this.score = data?.score ?? 0;
    this.suspicious = data?.suspicious ?? false;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.battleId = reader.readOptionalString();
    this.kills = reader.readInt32BE();
    this.score = reader.readInt32BE();
    this.suspicious = reader.readUInt8() === 1;
    this.nickname = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.battleId);
    writer.writeInt32BE(this.kills);
    writer.writeInt32BE(this.score);
    writer.writeUInt8(this.suspicious ? 1 : 0);
    writer.writeOptionalString(this.nickname);
    return writer.getBuffer();
  }

  toString(): string {
    return `AddUserToBattleDmPacket(battleId=${this.battleId}, nickname=${this.nickname}, kills=${this.kills}, score=${this.score})`;
  }

  static getId(): number {
    return -911626491;
  }
}
