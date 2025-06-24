import { ILobbyData, ILobbyDataProps } from "../interfaces/ILobbyData";
import { IPacket } from "../interfaces/IPacket";
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
    const nickBuffer = Buffer.from(this.nickname, "utf8");
    const profileUrlBuffer = Buffer.from(this.userProfileUrl, "utf8");

    const nickPartLength = 1 + 4 + nickBuffer.length;
    const urlPartLength = 1 + 4 + profileUrlBuffer.length;
    const fixedPartLength = 4 + 4 + 4 + 1 + 4 + 4 + 1 + 4 + 4 + 4;

    const packet = Buffer.alloc(fixedPartLength + nickPartLength + urlPartLength);
    let offset = 0;

    packet.writeInt32BE(this.crystals, offset);
    offset += 4;
    packet.writeInt32BE(this.currentRankScore, offset);
    offset += 4;
    packet.writeInt32BE(this.durationCrystalAbonement, offset);
    offset += 4;
    packet.writeInt8(this.hasDoubleCrystal ? 1 : 0, offset);
    offset += 1;
    packet.writeInt32BE(this.nextRankScore, offset);
    offset += 4;
    packet.writeInt32BE(this.place, offset);
    offset += 4;
    packet.writeInt8(this.rank, offset);
    offset += 1;
    packet.writeFloatBE(this.rating, offset);
    offset += 4;
    packet.writeInt32BE(this.score, offset);
    offset += 4;
    packet.writeInt32BE(this.serverNumber, offset);
    offset += 4;

    packet.writeInt8(this.nickname.length === 0 ? 1 : 0, offset);
    offset += 1;
    packet.writeInt32BE(nickBuffer.length, offset);
    offset += 4;
    nickBuffer.copy(packet, offset);
    offset += nickBuffer.length;

    packet.writeInt8(this.userProfileUrl.length === 0 ? 1 : 0, offset);
    offset += 1;
    packet.writeInt32BE(profileUrlBuffer.length, offset);
    offset += 4;
    profileUrlBuffer.copy(packet, offset);

    return packet;
  }

  toString(): string {
    return `LobbyData(nickname=${this.nickname}, rank=${this.rank}, score=${this.score})`;
  }

  static getId(): number {
    return 907073245;
  }
}
