import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IUpdateBattleUserDM, IUpdateBattleUserDMData } from "../interfaces/IUpdateBattleUserDM";
import { BasePacket } from "./BasePacket";

export default class UpdateBattleUserDMPacket extends BasePacket implements IUpdateBattleUserDM {
  deaths: number;
  kills: number;
  score: number;
  nickname: string | null;

  constructor(data?: IUpdateBattleUserDMData) {
    super();
    this.deaths = data?.deaths ?? 0;
    this.kills = data?.kills ?? 0;
    this.score = data?.score ?? 0;
    this.nickname = data?.nickname ?? null;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.deaths = reader.readInt32BE();
    this.kills = reader.readInt32BE();
    this.score = reader.readInt32BE();
    this.nickname = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.deaths);
    writer.writeInt32BE(this.kills);
    writer.writeInt32BE(this.score);
    writer.writeOptionalString(this.nickname);
    return writer.getBuffer();
  }

  toString(): string {
    return `UpdateBattleUserDMPacket(nickname=${this.nickname}, kills=${this.kills}, deaths=${this.deaths}, score=${this.score})`;
  }

  static getId(): number {
    return 696140460;
  }
}
