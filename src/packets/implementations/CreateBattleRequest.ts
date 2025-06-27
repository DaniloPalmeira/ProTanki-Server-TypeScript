import { BufferReader } from "../../utils/buffer/BufferReader";
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
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `CreateBattleRequest(name=${this.name}, map=${this.mapId})`;
  }

  static getId(): number {
    return -2135234426;
  }
}
