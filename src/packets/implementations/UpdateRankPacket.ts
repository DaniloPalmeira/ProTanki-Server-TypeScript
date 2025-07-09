import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IUpdateRank, IUpdateRankData } from "../interfaces/IUpdateRank";
import { BasePacket } from "./BasePacket";

export default class UpdateRankPacket extends BasePacket implements IUpdateRank {
  rank: number;
  score: number;
  currentRankScore: number;
  nextRankScore: number;
  reward: number;

  constructor(data?: IUpdateRankData) {
    super();
    this.rank = data?.rank ?? 0;
    this.score = data?.score ?? 0;
    this.currentRankScore = data?.currentRankScore ?? 0;
    this.nextRankScore = data?.nextRankScore ?? 0;
    this.reward = data?.reward ?? 0;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.rank = reader.readInt32BE();
    this.score = reader.readInt32BE();
    this.currentRankScore = reader.readInt32BE();
    this.nextRankScore = reader.readInt32BE();
    this.reward = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.rank);
    writer.writeInt32BE(this.score);
    writer.writeInt32BE(this.currentRankScore);
    writer.writeInt32BE(this.nextRankScore);
    writer.writeInt32BE(this.reward);
    return writer.getBuffer();
  }

  toString(): string {
    return `UpdateRankPacket(rank=${this.rank}, score=${this.score}, currentRankScore=${this.currentRankScore}, nextRankScore=${this.nextRankScore}, reward=${this.reward})`;
  }

  static getId(): number {
    return 1989173907;
  }
}
