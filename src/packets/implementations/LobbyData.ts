import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ILobbyData, ILobbyDataProps } from "../interfaces/ILobbyData";
import { BasePacket } from "./BasePacket";

export default class LobbyData extends BasePacket implements ILobbyData {
  crystals: number = 0;
  currentRankScore: number = 0;
  durationCrystalAbonement: number = 0;
  hasDoubleCrystal: boolean = false;
  nextRankScore: number = 0;
  place: number = 0;
  rank: number = 0;
  rating: number = 0;
  score: number = 0;
  serverNumber: number = 0;
  nickname: string = "";
  userProfileUrl: string = "";

  constructor(data?: ILobbyDataProps) {
    super();
    if (data) {
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
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.crystals = reader.readInt32BE();
    this.currentRankScore = reader.readInt32BE();
    this.durationCrystalAbonement = reader.readInt32BE();
    this.hasDoubleCrystal = reader.readUInt8() === 1;
    this.nextRankScore = reader.readInt32BE();
    this.place = reader.readInt32BE();
    this.rank = reader.readUInt8();
    this.rating = reader.readFloatBE();
    this.score = reader.readInt32BE();
    this.serverNumber = reader.readInt32BE();
    this.nickname = reader.readOptionalString() ?? "";
    this.userProfileUrl = reader.readOptionalString() ?? "";
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
    return (
      `LobbyData(\n` +
      `  crystals=${this.crystals},\n` +
      `  currentRankScore=${this.currentRankScore},\n` +
      `  durationCrystalAbonement=${this.durationCrystalAbonement},\n` +
      `  hasDoubleCrystal=${this.hasDoubleCrystal},\n` +
      `  nextRankScore=${this.nextRankScore},\n` +
      `  place=${this.place},\n` +
      `  rank=${this.rank},\n` +
      `  rating=${this.rating},\n` +
      `  score=${this.score},\n` +
      `  serverNumber=${this.serverNumber},\n` +
      `  nickname='${this.nickname}',\n` +
      `  userProfileUrl='${this.userProfileUrl}'\n` +
      `)`
    );
  }

  static getId(): number {
    return 907073245;
  }
}
