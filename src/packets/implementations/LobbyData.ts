import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ILobbyData, ILobbyDataProps } from "../interfaces/ILobbyData";
import { BasePacket } from "./BasePacket";

export default class LobbyData extends BasePacket implements ILobbyData {
  crystals: number;
  currentRankScore: number;
  durationCrystalAbonement: number;
  hasDoubleCrystal: boolean;
  nextRankScore: number;
  place: number;
  rank: number;
  rating: number;
  score: number;
  serverNumber: number;
  nickname: string;
  userProfileUrl: string;

  constructor(data: ILobbyDataProps) {
    super();
    this.crystals = data.crystals;
    this.currentRankScore = data.currentRankScore;
    this.durationCrystalAbonement = data.durationCrystalAbonement;
    this.hasDoubleCrystal = data.hasDoubleCrystal;
    this.nextRankScore = data.nextRankScore;
    this.place = data.place;
    this.rank = data.rank;
    this.rating = data.rating;
    this.score = data.score;
    this.serverNumber = data.serverNumber;
    this.nickname = data.nickname;
    this.userProfileUrl = data.userProfileUrl;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.crystals);
    writer.writeInt32BE(this.currentRankScore);
    writer.writeInt32BE(this.durationCrystalAbonement);
    writer.writeUInt8(this.hasDoubleCrystal ? 1 : 0);
    writer.writeInt32BE(this.nextRankScore);
    writer.writeInt32BE(this.place);
    writer.writeUInt8(this.rank);
    writer.writeFloatBE(this.rating);
    writer.writeInt32BE(this.score);
    writer.writeInt32BE(this.serverNumber);
    writer.writeOptionalString(this.nickname);
    writer.writeOptionalString(this.userProfileUrl);
    return writer.getBuffer();
  }

  toString(): string {
    return `LobbyData(nickname=${this.nickname}, rank=${this.rank}, score=${this.score})`;
  }

  static getId(): number {
    return 907073245;
  }
}
