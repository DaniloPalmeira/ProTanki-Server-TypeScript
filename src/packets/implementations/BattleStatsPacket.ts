import { BattleMode, EquipmentConstraintsMode } from "../../models/Battle";
import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IBattleStats, IBattleStatsData } from "../interfaces/IBattleStats";
import { BasePacket } from "./BasePacket";

export default class BattleStatsPacket extends BasePacket implements IBattleStats {
  battleMode: BattleMode;
  equipmentConstraintsMode: EquipmentConstraintsMode;
  fund: number;
  scoreLimit: number;
  timeLimitInSec: number;
  mapName: string | null;
  maxPeopleCount: number;
  parkourMode: boolean;
  premiumBonusInPercent: number;
  spectator: boolean;
  suspiciousUserIds: string[];
  timeLeft: number;
  valuableRound: number;

  constructor(data: IBattleStatsData) {
    super();
    this.battleMode = data.battleMode;
    this.equipmentConstraintsMode = data.equipmentConstraintsMode;
    this.fund = data.fund;
    this.scoreLimit = data.scoreLimit;
    this.timeLimitInSec = data.timeLimitInSec;
    this.mapName = data.mapName;
    this.maxPeopleCount = data.maxPeopleCount;
    this.parkourMode = data.parkourMode;
    this.premiumBonusInPercent = data.premiumBonusInPercent;
    this.spectator = data.spectator;
    this.suspiciousUserIds = data.suspiciousUserIds;
    this.timeLeft = data.timeLeft;
    this.valuableRound = data.valuableRound;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.battleMode = reader.readInt32BE();
    this.equipmentConstraintsMode = reader.readInt32BE();
    this.fund = reader.readInt32BE();
    this.scoreLimit = reader.readInt32BE();
    this.timeLimitInSec = reader.readInt32BE();
    this.mapName = reader.readOptionalString();
    this.maxPeopleCount = reader.readInt32BE();
    this.parkourMode = reader.readUInt8() === 1;
    this.premiumBonusInPercent = reader.readInt32BE();
    this.spectator = reader.readUInt8() === 1;
    this.suspiciousUserIds = reader.readStringArray();
    this.timeLeft = reader.readInt32BE();
    this.valuableRound = reader.readInt8();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.battleMode);
    writer.writeInt32BE(this.equipmentConstraintsMode);
    writer.writeInt32BE(this.fund);
    writer.writeInt32BE(this.scoreLimit);
    writer.writeInt32BE(this.timeLimitInSec);
    writer.writeOptionalString(this.mapName);
    writer.writeInt32BE(this.maxPeopleCount);
    writer.writeUInt8(this.parkourMode ? 1 : 0);
    writer.writeInt32BE(this.premiumBonusInPercent);
    writer.writeUInt8(this.spectator ? 1 : 0);
    writer.writeStringArray(this.suspiciousUserIds);
    writer.writeInt32BE(this.timeLeft);
    writer.writeInt8(this.valuableRound);
    return writer.getBuffer();
  }

  toString(): string {
    return (
      `BattleStatsPacket(\n` +
      `  battleMode=${this.battleMode},\n` +
      `  equipmentConstraintsMode=${this.equipmentConstraintsMode},\n` +
      `  fund=${this.fund},\n` +
      `  scoreLimit=${this.scoreLimit},\n` +
      `  timeLimitInSec=${this.timeLimitInSec},\n` +
      `  mapName=${this.mapName},\n` +
      `  maxPeopleCount=${this.maxPeopleCount},\n` +
      `  parkourMode=${this.parkourMode},\n` +
      `  premiumBonusInPercent=${this.premiumBonusInPercent},\n` +
      `  spectator=${this.spectator},\n` +
      `  suspiciousUserIds=[${this.suspiciousUserIds.join(",")}],\n` +
      `  timeLeft=${this.timeLeft},\n` +
      `  valuableRound=${this.valuableRound}\n` +
      `)`
    );
  }

  static getId(): number {
    return 522993449;
  }
}
