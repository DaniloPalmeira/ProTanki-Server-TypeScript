import { UserDocument } from "../models/User";
import { Battle, BattleMode, EquipmentConstraintsMode, IBattleCreationSettings, MapTheme } from "../models/Battle";
import { ValidationUtils } from "../utils/ValidationUtils";
import logger from "../utils/Logger";

export class BattleService {
  private activeBattles: Map<string, Battle> = new Map();

  constructor() {
    this.createDefaultBattle();
  }

  private createDefaultBattle(): void {
    const defaultBattleSettings: IBattleCreationSettings = {
      name: "Batalha para Novatos",
      privateBattle: false,
      proBattle: false,
      battleMode: BattleMode.DM,
      mapId: "map_sandbox",
      maxPeopleCount: 8,
      minRank: 1,
      maxRank: 30,
      timeLimitInSec: 600,
      scoreLimit: 20,
      autoBalance: true,
      friendlyFire: false,
      parkourMode: false,
      equipmentConstraintsMode: EquipmentConstraintsMode.NONE,
      reArmorEnabled: false,
      mapTheme: MapTheme.SUMMER,
      withoutBonuses: false,
      withoutCrystals: false,
      withoutSupplies: false,
      withoutUpgrades: false,
      reducedResistances: false,
      esportDropTiming: false,
      withoutGoldBoxes: false,
      withoutGoldSiren: false,
      withoutGoldZone: false,
      withoutMedkit: false,
      withoutMines: false,
      randomGold: true,
      dependentCooldownEnabled: false,
    };
    this.createBattle(defaultBattleSettings);
  }

  public validateName(name: string): string {
    if (ValidationUtils.isNicknameInappropriate(name)) {
      return "****";
    }
    return name;
  }

  public createBattle(settings: IBattleCreationSettings, creator?: UserDocument): Battle {
    const battle = new Battle(settings);

    this.activeBattles.set(battle.battleId, battle);
    logger.info(`Battle created`, {
      battleId: battle.battleId,
      name: settings.name,
      creator: creator?.username ?? "System",
    });
    return battle;
  }

  public getBattles(): Battle[] {
    return Array.from(this.activeBattles.values());
  }

  public getBattleById(id: string): Battle | undefined {
    return this.activeBattles.get(id);
  }

  public isUserInBattle(username: string): boolean {
    const lowercasedUsername = username.toLowerCase();
    for (const battle of this.activeBattles.values()) {
      const isUserInBattle = battle.users.some((u) => u.username.toLowerCase() === lowercasedUsername) || battle.usersBlue.some((u) => u.username.toLowerCase() === lowercasedUsername) || battle.usersRed.some((u) => u.username.toLowerCase() === lowercasedUsername);

      if (isUserInBattle) {
        return true;
      }
    }
    return false;
  }

  public findBattleForPlayer(user: UserDocument): Battle | undefined {
    return this.getBattles().find((battle) => {
      const settings = battle.settings;
      return !settings.privateBattle && user.rank >= settings.minRank && user.rank <= settings.maxRank;
    });
  }
}
