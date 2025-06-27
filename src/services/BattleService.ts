import { UserDocument } from "../models/User";
import { Battle, IBattleCreationSettings } from "../models/Battle";
import { ValidationUtils } from "../utils/ValidationUtils";
import logger from "../utils/Logger";

export class BattleService {
  private activeBattles: Map<string, Battle> = new Map();

  public validateName(name: string): string {
    if (ValidationUtils.isNicknameInappropriate(name)) {
      return "****";
    }
    return name;
  }

  public createBattle(settings: IBattleCreationSettings, creator: UserDocument): Battle {
    const battle = new Battle(settings, creator);
    this.activeBattles.set(battle.battleId, battle);
    logger.info(`Battle created by ${creator.username}`, { battleId: battle.battleId, name: settings.name });
    return battle;
  }

  public getBattles(): Battle[] {
    return Array.from(this.activeBattles.values());
  }

  public getBattleById(id: string): Battle | undefined {
    return this.activeBattles.get(id);
  }
}
