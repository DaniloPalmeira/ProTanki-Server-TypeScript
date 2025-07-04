import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { ICreateBattleRequest } from "../interfaces/ICreateBattle";
import { BasePacket } from "./BasePacket";
import { BattleMode, EquipmentConstraintsMode, MapTheme } from "../../models/Battle";

export default class CreateBattleRequest extends BasePacket implements ICreateBattleRequest {
  autoBalance: boolean = false;
  battleMode: BattleMode = BattleMode.DM;
  equipmentConstraintsMode: EquipmentConstraintsMode = EquipmentConstraintsMode.NONE;
  friendlyFire: boolean = false;
  scoreLimit: number = 0;
  timeLimitInSec: number = 0;
  mapId: string = "";
  maxPeopleCount: number = 0;
  name: string = "";
  parkourMode: boolean = false;
  privateBattle: boolean = false;
  proBattle: boolean = false;
  maxRank: number = 1;
  minRank: number = 1;
  reArmorEnabled: boolean = false;
  mapTheme: MapTheme = MapTheme.SUMMER;
  withoutBonuses: boolean = false;
  withoutCrystals: boolean = false;
  withoutSupplies: boolean = false;
  withoutUpgrades: boolean = false;
  reducedResistances: boolean = false;
  esportDropTiming: boolean = false;
  withoutGoldBoxes: boolean = false;
  withoutGoldSiren: boolean = false;
  withoutGoldZone: boolean = false;
  withoutMedkit: boolean = false;
  withoutMines: boolean = false;
  randomGold: boolean = false;
  dependentCooldownEnabled: boolean = false;

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);

    this.autoBalance = reader.readUInt8() === 1;
    this.battleMode = reader.readInt32BE();
    this.equipmentConstraintsMode = reader.readInt32BE();
    this.friendlyFire = reader.readUInt8() === 1;
    this.scoreLimit = reader.readInt32BE();
    this.timeLimitInSec = reader.readInt32BE();
    this.mapId = reader.readOptionalString() ?? "";
    this.maxPeopleCount = reader.readInt32BE();
    this.name = reader.readOptionalString() ?? "";
    this.parkourMode = reader.readUInt8() === 1;
    this.privateBattle = reader.readUInt8() === 1;
    this.proBattle = reader.readUInt8() === 1;
    this.maxRank = reader.readInt32BE();
    this.minRank = reader.readInt32BE();
    this.reArmorEnabled = reader.readUInt8() === 1;
    this.mapTheme = reader.readInt32BE();
    this.withoutBonuses = reader.readUInt8() === 1;
    this.withoutCrystals = reader.readUInt8() === 1;
    this.withoutSupplies = reader.readUInt8() === 1;
    this.withoutUpgrades = reader.readUInt8() === 1;
    this.reducedResistances = reader.readUInt8() === 1;
    this.esportDropTiming = reader.readUInt8() === 1;
    this.withoutGoldBoxes = reader.readUInt8() === 1;
    this.withoutGoldSiren = reader.readUInt8() === 1;
    this.withoutGoldZone = reader.readUInt8() === 1;
    this.withoutMedkit = reader.readUInt8() === 1;
    this.withoutMines = reader.readUInt8() === 1;
    this.randomGold = reader.readUInt8() === 1;
    this.dependentCooldownEnabled = reader.readUInt8() === 1;
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeUInt8(this.autoBalance ? 1 : 0);
    writer.writeInt32BE(this.battleMode);
    writer.writeInt32BE(this.equipmentConstraintsMode);
    writer.writeUInt8(this.friendlyFire ? 1 : 0);
    writer.writeInt32BE(this.scoreLimit);
    writer.writeInt32BE(this.timeLimitInSec);
    writer.writeOptionalString(this.mapId);
    writer.writeInt32BE(this.maxPeopleCount);
    writer.writeOptionalString(this.name);
    writer.writeUInt8(this.parkourMode ? 1 : 0);
    writer.writeUInt8(this.privateBattle ? 1 : 0);
    writer.writeUInt8(this.proBattle ? 1 : 0);
    writer.writeInt32BE(this.maxRank);
    writer.writeInt32BE(this.minRank);
    writer.writeUInt8(this.reArmorEnabled ? 1 : 0);
    writer.writeInt32BE(this.mapTheme);
    writer.writeUInt8(this.withoutBonuses ? 1 : 0);
    writer.writeUInt8(this.withoutCrystals ? 1 : 0);
    writer.writeUInt8(this.withoutSupplies ? 1 : 0);
    writer.writeUInt8(this.withoutUpgrades ? 1 : 0);
    writer.writeUInt8(this.reducedResistances ? 1 : 0);
    writer.writeUInt8(this.esportDropTiming ? 1 : 0);
    writer.writeUInt8(this.withoutGoldBoxes ? 1 : 0);
    writer.writeUInt8(this.withoutGoldSiren ? 1 : 0);
    writer.writeUInt8(this.withoutGoldZone ? 1 : 0);
    writer.writeUInt8(this.withoutMedkit ? 1 : 0);
    writer.writeUInt8(this.withoutMines ? 1 : 0);
    writer.writeUInt8(this.randomGold ? 1 : 0);
    writer.writeUInt8(this.dependentCooldownEnabled ? 1 : 0);
    return writer.getBuffer();
  }

  toString(): string {
    return (
      `CreateBattleRequest(\n` +
      `  name: ${this.name},\n` +
      `  mapId: ${this.mapId},\n` +
      `  battleMode: ${BattleMode[this.battleMode]},\n` +
      `  maxPeopleCount: ${this.maxPeopleCount},\n` +
      `  timeLimitInSec: ${this.timeLimitInSec},\n` +
      `  scoreLimit: ${this.scoreLimit},\n` +
      `  minRank: ${this.minRank},\n` +
      `  maxRank: ${this.maxRank},\n` +
      `  privateBattle: ${this.privateBattle},\n` +
      `  proBattle: ${this.proBattle},\n` +
      `  autoBalance: ${this.autoBalance},\n` +
      `  friendlyFire: ${this.friendlyFire},\n` +
      `  parkourMode: ${this.parkourMode},\n` +
      `  equipmentConstraintsMode: ${EquipmentConstraintsMode[this.equipmentConstraintsMode]},\n` +
      `  withoutBonuses: ${this.withoutBonuses},\n` +
      `  withoutCrystals: ${this.withoutCrystals},\n` +
      `  withoutSupplies: ${this.withoutSupplies},\n` +
      `  withoutUpgrades: ${this.withoutUpgrades},\n` +
      `  reArmorEnabled: ${this.reArmorEnabled},\n` +
      `  reducedResistances: ${this.reducedResistances}\n` +
      `)`
    );
  }

  static getId(): number {
    return -2135234426;
  }
}
