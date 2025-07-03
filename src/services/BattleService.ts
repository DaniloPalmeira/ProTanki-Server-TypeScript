import { UserDocument } from "../models/User";
import { Battle, BattleMode, EquipmentConstraintsMode, IBattleCreationSettings, MapTheme } from "../models/Battle";
import { ValidationUtils } from "../utils/ValidationUtils";
import logger from "../utils/Logger";
import { ProTankiServer } from "../server/ProTankiServer";
import RemoveTankPacket from "../packets/implementations/RemoveTankPacket";
import UserDisconnectedDmPacket from "../packets/implementations/UserDisconnectedDmPacket";
import RemoveUserFromBattleLobbyPacket from "../packets/implementations/RemoveUserFromBattleLobbyPacket";
import ReleasePlayerSlotDmPacket from "../packets/implementations/ReleasePlayerSlotDmPacket";
import UserNotInBattlePacket from "../packets/implementations/UserNotInBattlePacket";

interface IDisconnectedPlayerInfo {
  battleId: string;
  timeoutId: NodeJS.Timeout;
}

export class BattleService {
  private activeBattles: Map<string, Battle> = new Map();
  private disconnectedPlayers = new Map<string, IDisconnectedPlayerInfo>();
  private server: ProTankiServer;

  constructor(server: ProTankiServer) {
    this.server = server;
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
      reArmorEnabled: true,
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

  public announceTankRemoval(user: UserDocument, battle: Battle): void {
    const remainingPlayers = [...battle.users, ...battle.usersBlue, ...battle.usersRed].filter((p) => p.id !== user.id);

    const removeTankPacket = new RemoveTankPacket(user.username);
    remainingPlayers.forEach((player) => {
      const client = this.server.findClientByUsername(player.username);
      if (client) client.sendPacket(removeTankPacket);
    });

    if (battle.settings.battleMode === BattleMode.DM) {
      const disconnectPacket = new UserDisconnectedDmPacket(user.username);
      remainingPlayers.forEach((player) => {
        const client = this.server.findClientByUsername(player.username);
        if (client) client.sendPacket(disconnectPacket);
      });
    }
  }

  public async finalizeBattleExit(user: UserDocument, battle: Battle, friendsToNotify?: string[]): Promise<void> {
    const battleDetailWatchers = this.server.getClients().filter((c) => (c.getState() === "chat_lobby" || c.getState() === "battle_lobby") && c.lastViewedBattleId === battle.battleId);
    if (battleDetailWatchers.length > 0) {
      const removeUserPacket = new RemoveUserFromBattleLobbyPacket({ battleId: battle.battleId, nickname: user.username });
      for (const watcher of battleDetailWatchers) {
        watcher.sendPacket(removeUserPacket);
      }
    }

    if (battle.settings.battleMode === BattleMode.DM) {
      const releaseSlotPacket = new ReleasePlayerSlotDmPacket({ battleId: battle.battleId, nickname: user.username });
      this.server.broadcastToBattleList(releaseSlotPacket);
    }

    let friends: string[] = friendsToNotify || [];
    if (!friendsToNotify) {
      const populatedUser = await user.populate<{ friends: UserDocument[] }>("friends");
      friends = populatedUser.friends.map((f) => f.username);
    }

    if (friends.length > 0) {
      const userNotInBattlePacket = new UserNotInBattlePacket(user.username);
      for (const friendUsername of friends) {
        const friendClient = this.server.findClientByUsername(friendUsername);
        if (friendClient) {
          friendClient.sendPacket(userNotInBattlePacket);
        }
      }
    }

    this.removeUserFromBattle(user, battle);
  }

  public handlePlayerDisconnection(user: UserDocument, battle: Battle): void {
    logger.info(`Player ${user.username} disconnected from battle ${battle.battleId}. Starting 1-minute reconnect timer.`);

    this.announceTankRemoval(user, battle);

    const timeoutId = setTimeout(() => {
      logger.info(`Reconnect timer for ${user.username} expired. Finalizing disconnection.`);
      this.disconnectedPlayers.delete(user.id);
      this.finalizeDisconnection(user, battle);
    }, 60000);

    this.disconnectedPlayers.set(user.id, { battleId: battle.battleId, timeoutId });
  }

  public handlePlayerReconnection(user: UserDocument): { battleId: string } | null {
    const disconnectedInfo = this.disconnectedPlayers.get(user.id);
    if (disconnectedInfo) {
      logger.info(`Player ${user.username} reconnected in time.`);
      clearTimeout(disconnectedInfo.timeoutId);
      this.disconnectedPlayers.delete(user.id);
      return { battleId: disconnectedInfo.battleId };
    }
    return null;
  }

  private async finalizeDisconnection(user: UserDocument, battle: Battle): Promise<void> {
    await this.finalizeBattleExit(user, battle);
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

  public addUserToBattle(user: UserDocument, battleId: string, teamIndex: number): Battle {
    const battle = this.getBattleById(battleId);
    if (!battle) throw new Error("A batalha selecionada não existe mais.");

    const settings = battle.settings;
    if (user.rank < settings.minRank || user.rank > settings.maxRank) {
      throw new Error("Seu rank não é compatível com esta batalha.");
    }

    const allPlayers = [...battle.users, ...battle.usersRed, ...battle.usersBlue];
    const isAlreadyInBattle = allPlayers.some((p) => p.id === user.id);

    if (isAlreadyInBattle) {
      throw new Error("Você já está nesta batalha.");
    }

    if (allPlayers.length >= settings.maxPeopleCount) {
      throw new Error("Esta batalha está cheia.");
    }

    if (battle.isTeamMode()) {
      if (teamIndex === 0) battle.usersRed.push(user);
      else if (teamIndex === 1) battle.usersBlue.push(user);
      else throw new Error("Time inválido selecionado.");
    } else {
      battle.users.push(user);
    }

    logger.info(`User ${user.username} added to battle ${battle.battleId}`);
    return battle;
  }

  public removeUserFromBattle(user: UserDocument, battle: Battle): void {
    const userId = user.id;

    battle.users = battle.users.filter((u) => u.id !== userId);
    battle.usersBlue = battle.usersBlue.filter((u) => u.id !== userId);
    battle.usersRed = battle.usersRed.filter((u) => u.id !== userId);

    logger.info(`User ${user.username} removed from battle ${battle.battleId}`);
  }
}
