import { BattleMode } from "../../models/Battle";
import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { INotifyFriendOfBattle, INotifyFriendOfBattleData } from "../interfaces/INotifyFriendOfBattle";
import { BasePacket } from "./BasePacket";

export default class NotifyFriendOfBattlePacket extends BasePacket implements INotifyFriendOfBattle {
  battleId: string | null;
  mapName: string | null;
  mode: BattleMode;
  privateBattle: boolean;
  probattle: boolean;
  maxRank: number;
  minRank: number;
  serverNumber: number;
  nickname: string | null;

  constructor(data?: INotifyFriendOfBattleData) {
    super();
    this.battleId = data?.battleId ?? null;
    this.mapName = data?.mapName ?? null;
    this.mode = data?.mode ?? BattleMode.DM;
    this.privateBattle = data?.privateBattle ?? false;
    this.probattle = data?.probattle ?? false;
    this.maxRank = data?.maxRank ?? 0;
    this.minRank = data?.minRank ?? 0;
    this.serverNumber = data?.serverNumber ?? 0;
    this.nickname = data?.nickname ?? null;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.battleId = reader.readOptionalString();
    this.mapName = reader.readOptionalString();
    this.mode = reader.readInt32BE();
    this.privateBattle = reader.readUInt8() === 1;
    this.probattle = reader.readUInt8() === 1;
    this.maxRank = reader.readInt32BE();
    this.minRank = reader.readInt32BE();
    this.serverNumber = reader.readInt32BE();
    this.nickname = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.battleId);
    writer.writeOptionalString(this.mapName);
    writer.writeInt32BE(this.mode);
    writer.writeUInt8(this.privateBattle ? 1 : 0);
    writer.writeUInt8(this.probattle ? 1 : 0);
    writer.writeInt32BE(this.maxRank);
    writer.writeInt32BE(this.minRank);
    writer.writeInt32BE(this.serverNumber);
    writer.writeOptionalString(this.nickname);
    return writer.getBuffer();
  }

  toString(): string {
    return `NotifyFriendOfBattlePacket(nickname=${this.nickname}, battleId=${this.battleId})`;
  }

  static getId(): number {
    return -1895446889;
  }
}
