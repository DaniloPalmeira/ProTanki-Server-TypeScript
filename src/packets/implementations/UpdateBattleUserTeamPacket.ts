import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IUpdateBattleUserTeam, IUpdateBattleUserTeamData } from "../interfaces/IUpdateBattleUserTeam";
import { BasePacket } from "./BasePacket";

export default class UpdateBattleUserTeamPacket extends BasePacket implements IUpdateBattleUserTeam {
  deaths: number;
  kills: number;
  score: number;
  nickname: string | null;
  team: number;

  constructor(data?: IUpdateBattleUserTeamData) {
    super();
    this.deaths = data?.deaths ?? 0;
    this.kills = data?.kills ?? 0;
    this.score = data?.score ?? 0;
    this.nickname = data?.nickname ?? null;
    this.team = data?.team ?? 2;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.deaths = reader.readInt32BE();
    this.kills = reader.readInt32BE();
    this.score = reader.readInt32BE();
    this.nickname = reader.readOptionalString();
    this.team = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.deaths);
    writer.writeInt32BE(this.kills);
    writer.writeInt32BE(this.score);
    writer.writeOptionalString(this.nickname);
    writer.writeInt32BE(this.team);
    return writer.getBuffer();
  }

  toString(): string {
    return `UpdateBattleUserTeamPacket(nickname=${this.nickname}, kills=${this.kills}, deaths=${this.deaths}, score=${this.score}, team=${this.team})`;
  }

  static getId(): number {
    return -497293992;
  }
}
