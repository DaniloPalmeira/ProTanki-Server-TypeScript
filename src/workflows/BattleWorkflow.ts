import { Battle, BattleMode, MapTheme } from "../models/Battle";
import BonusDataPacket from "../packets/implementations/BonusDataPacket";
import InitMapPacket from "../packets/implementations/InitMapPacket";
import LoadDependencies from "../packets/implementations/LoadDependencies";
import SetLayout from "../packets/implementations/SetLayout";
import UnloadBattleListPacket from "../packets/implementations/UnloadBattleListPacket";
import UnloadLobbyChatPacket from "../packets/implementations/UnloadLobbyChatPacket";
import WeaponPhysicsPacket from "../packets/implementations/WeaponPhysicsPacket";
import { ProTankiClient } from "../server/ProTankiClient";
import { ProTankiServer } from "../server/ProTankiServer";
import { CALLBACK } from "../config/constants";
import { getBonusData } from "../config/BonusData";
import { weaponPhysicsData } from "../config/PhysicsData";
import { ResourceManager } from "../utils/ResourceManager";
import { ResourceId } from "../types/resourceTypes";
import logger from "../utils/Logger";
import BattleStatsPacket from "../packets/implementations/BattleStatsPacket";
import { battleDataObject } from "../config/BattleData";
import LoadBattleChatPacket from "../packets/implementations/LoadBattleChatPacket";
import InitBattleTeamPacket from "../packets/implementations/InitBattleTeamPacket";
import InitBattleDMPacket from "../packets/implementations/InitBattleDMPacket";
import { UserDocument } from "../models/User";
import { IBattleUser } from "../packets/interfaces/IBattleUser";
import InitBattleUsersDMPacket from "../packets/implementations/InitBattleUsersDMPacket";
import InitBattleUsersTeamPacket from "../packets/implementations/InitBattleUsersTeamPacket";
import InitializeBattleStatisticsPacket from "../packets/implementations/InitializeBattleStatisticsPacket";
import BattleMinesPropertiesPacket from "../packets/implementations/BattleMinesPropertiesPacket";
import BattleConsumablesPacket from "../packets/implementations/BattleConsumablesPacket";
import TankModelDataPacket from "../packets/implementations/TankModelDataPacket";
import BattleUserEffectsPacket from "../packets/implementations/BattleUserEffectsPacket";
import BonusRegionsPacket from "../packets/implementations/BonusRegionsPacket";
import { BonusType } from "../packets/interfaces/IBonusRegion";
import ConfirmLayoutChange from "../packets/implementations/ConfirmLayoutChange";
import { suppliesData } from "../config/SuppliesData";
import UserConnectDMPacket from "../packets/implementations/UserConnectDMPacket";
import { IBattleUserInfo } from "../packets/interfaces/IUserConnectDM";

export class BattleWorkflow {
  public static async enterBattle(client: ProTankiClient, server: ProTankiServer, battle: Battle): Promise<void> {
    if (!client.user) {
      logger.error("Attempted to enter battle without a user authenticated.", { client: client.getRemoteAddress() });
      return;
    }

    client.setState("battle");
    logger.info(`User ${client.user.username} is entering battle ${battle.battleId}`);

    client.sendPacket(new SetLayout(3));
    client.sendPacket(new UnloadBattleListPacket());
    client.sendPacket(new UnloadLobbyChatPacket());
    client.startTimeChecker();
    client.sendPacket(new WeaponPhysicsPacket(JSON.stringify(weaponPhysicsData)));
    client.sendPacket(new BonusDataPacket(JSON.stringify(getBonusData())));

    const dependencies = { resources: ResourceManager.getMapResourcesByMapId(battle.settings.mapId) };
    client.sendPacket(new LoadDependencies(dependencies, CALLBACK.BATTLE_MAP_LIBS_LOADED));
  }

  public static loadMapResources(client: ProTankiClient, server: ProTankiServer, battle: Battle): void {
    logger.info(`User ${client.user?.username} is loading skybox for battle ${battle.battleId}.`);

    const skyboxResourceIds: ResourceId[] = ["skybox/default/part1", "skybox/default/part2", "skybox/default/part3", "skybox/default/part4", "skybox/default/part5", "skybox/default/part6"];

    const dependencies = { resources: ResourceManager.getBulkResources(skyboxResourceIds) };
    client.sendPacket(new LoadDependencies(dependencies, CALLBACK.BATTLE_SKYBOX_LOADED));
  }

  public static loadMapGeometry(client: ProTankiClient, server: ProTankiServer, battle: Battle): void {
    logger.info(`User ${client.user?.username} is loading map geometry for battle ${battle.battleId}.`);

    const mapId = battle.settings.mapId;
    const mapResourceId = `maps/${mapId}/xml` as ResourceId;

    const dependencies = { resources: ResourceManager.getBulkResources([mapResourceId]) };
    client.sendPacket(new LoadDependencies(dependencies, CALLBACK.BATTLE_MAP_GEOMETRY_LOADED));
  }

  public static loadGeneralBattleResources(client: ProTankiClient, server: ProTankiServer, battle: Battle): void {
    logger.info(`User ${client.user?.username} is loading general battle resources for battle ${battle.battleId}.`);

    const generalResources: ResourceId[] = [
      "sounds/maps/sandbox_ambient",
      "effects/dust",
      "sounds/mine_activate",
      "effects/mine/blue_mine_texture",
      "sounds/mine_deactivate",
      "effects/mine/enemy_mine_texture",
      "effects/mine/explosion_mark_texture",
      "sounds/mine_explosion",
      "effects/mine/friendly_mine_texture",
      "effects/mine/idle_explosion_texture",
      "effects/mine/main_explosion_texture",
      "effects/mine/model",
      "effects/mine/red_mine_texture",
      "sounds/hull/engine_idle",
      "sounds/hull/engine_start",
      "sounds/hull/engine_move",
      "sounds/turret/turn",
      "effects/smoky/critical_hit",
      "effects/smoky/explosion_mark",
      "sounds/smoky/explosion",
      "effects/smoky/explosion",
      "sounds/smoky/shot",
      "effects/smoky/shot",
      "effects/bonus/drop_location_marker",
      "effects/explosions/fire",
      "effects/explosions/shockwave",
      "effects/explosions/smoke",
      "paint/destroyed/texture",
    ];

    const dependencies = { resources: ResourceManager.getBulkResources(generalResources) };
    client.sendPacket(new LoadDependencies(dependencies, CALLBACK.BATTLE_GENERAL_RESOURCES_LOADED));
  }

  public static loadPlayerEquipment(client: ProTankiClient, server: ProTankiServer, battle: Battle): void {
    logger.info(`User ${client.user?.username} is loading player equipment for battle ${battle.battleId}.`);

    const allPlayers = [...battle.users, ...battle.usersRed, ...battle.usersBlue];
    const resourceSet = new Set<ResourceId>();

    allPlayers.forEach((player) => {
      const turretId = player.equippedTurret;
      const turretMod = player.turrets.get(turretId) ?? 0;
      resourceSet.add(`turret/${turretId}/m${turretMod}/model` as ResourceId);

      const hullId = player.equippedHull;
      const hullMod = player.hulls.get(hullId) ?? 0;
      resourceSet.add(`hull/${hullId}/m${hullMod}/model` as ResourceId);

      const paintId = player.equippedPaint;
      resourceSet.add(`paint/${paintId}/texture` as ResourceId);
    });

    const dependencies = { resources: ResourceManager.getBulkResources(Array.from(resourceSet)) };
    client.sendPacket(new LoadDependencies(dependencies, CALLBACK.BATTLE_PLAYER_EQUIPMENT_LOADED));
  }

  private static mapUserToBattleUser(user: UserDocument): IBattleUser {
    return {
      chatModeratorLevel: user.chatModeratorLevel,
      deaths: 0,
      kills: 0,
      rank: user.rank,
      score: 0,
      uid: user.username,
    };
  }

  private static _getTankModelDataJson(client: ProTankiClient, battle: Battle): string {
    const user = client.user!;
    const hullId = user.equippedHull;
    const hullMod = user.hulls.get(hullId) ?? 0;
    const turretId = user.equippedTurret;
    const turretMod = user.turrets.get(turretId) ?? 0;
    const paintId = user.equippedPaint;

    let team_type = "NONE";
    if (battle.isTeamMode()) {
      if (battle.usersBlue.some((u) => u.id === user.id)) team_type = "BLUE";
      if (battle.usersRed.some((u) => u.id === user.id)) team_type = "RED";
    }

    const partsObject = {
      engineIdleSound: ResourceManager.getIdlowById("sounds/hull/engine_idle"),
      engineStartMovingSound: ResourceManager.getIdlowById("sounds/hull/engine_start"),
      engineMovingSound: ResourceManager.getIdlowById("sounds/hull/engine_move"),
    };

    const sfxData = {
      criticalHitSize: 375,
      criticalHitTexture: ResourceManager.getIdlowById("effects/smoky/critical_hit"),
      explosionMarkTexture: ResourceManager.getIdlowById("effects/smoky/explosion_mark"),
      explosionSize: 300,
      explosionSound: ResourceManager.getIdlowById("sounds/smoky/explosion"),
      explosionTexture: ResourceManager.getIdlowById("effects/smoky/explosion"),
      shotSound: ResourceManager.getIdlowById("sounds/smoky/shot"),
      shotTexture: ResourceManager.getIdlowById("effects/smoky/shot"),
      lighting: [
        {
          name: "shot",
          light: [
            { attenuationBegin: 150, attenuationEnd: 450, color: 16571766, intensity: 0.9, time: 0 },
            { attenuationBegin: 1, attenuationEnd: 2, color: 16571766, intensity: 0, time: 300 },
          ],
        },
        {
          name: "hit",
          light: [
            { attenuationBegin: 100, attenuationEnd: 300, color: 16760576, intensity: 0.7, time: 0 },
            { attenuationBegin: 100, attenuationEnd: 300, color: 16760576, intensity: 0, time: 400 },
          ],
        },
      ],
      bcsh: [],
    };

    const data = {
      battleId: battle.battleId,
      colormap_id: ResourceManager.getIdlowById(`paint/${paintId}/texture` as ResourceId),
      hull_id: `${hullId}_m${hullMod}`,
      turret_id: `${turretId}_m${turretMod}`,
      team_type: team_type,
      partsObject: JSON.stringify(partsObject),
      hullResource: ResourceManager.getIdlowById(`hull/${hullId}/m${hullMod}/model` as ResourceId),
      turretResource: ResourceManager.getIdlowById(`turret/${turretId}/m${turretMod}/model` as ResourceId),
      sfxData: JSON.stringify(sfxData),
      position: { x: 0, y: 0, z: 0 },
      orientation: { x: 0, y: 0, z: 0 },
      incarnation: 0,
      tank_id: user.username,
      nickname: user.username,
      state: "newcome",
      maxSpeed: 10,
      maxTurnSpeed: 2.443460952792061,
      acceleration: 14,
      reverseAcceleration: 18,
      sideAcceleration: 16,
      turnAcceleration: 2.792526803190927,
      reverseTurnAcceleration: 4.886921905584122,
      mass: 3000,
      power: 14,
      dampingCoeff: 1500,
      turret_turn_speed: 2.1399481958702475,
      health: 100,
      rank: user.rank,
      kickback: 2.5,
      turretTurnAcceleration: 3.4800119955514934,
      impact_force: 3.3,
      state_null: true,
    };

    return JSON.stringify(data);
  }

  public static initializeBattle(client: ProTankiClient, server: ProTankiServer, battle: Battle): void {
    logger.info(`User ${client.user?.username} finished loading all battle resources for ${battle.battleId}. Initializing map...`);

    const settings = battle.settings;
    const mapId = settings.mapId;

    const skyboxData = {
      top: ResourceManager.getIdlowById("skybox/default/part1"),
      front: ResourceManager.getIdlowById("skybox/default/part2"),
      back: ResourceManager.getIdlowById("skybox/default/part3"),
      bottom: ResourceManager.getIdlowById("skybox/default/part4"),
      left: ResourceManager.getIdlowById("skybox/default/part5"),
      right: ResourceManager.getIdlowById("skybox/default/part6"),
    };

    const mapGraphicData = {
      mapId: mapId,
      mapTheme: MapTheme[settings.mapTheme],
      angleX: -0.85,
      angleZ: 2.5,
      lightColor: 13090219,
      shadowColor: 5530735,
      fogAlpha: 0.25,
      fogColor: 10543615,
      farLimit: 10000,
      nearLimit: 5000,
      gravity: 1000,
      skyboxRevolutionSpeed: 0.0,
      ssaoColor: 2045258,
      dustAlpha: 0.75,
      dustDensity: 0.15,
      dustFarDistance: 7000,
      dustNearDistance: 5000,
      dustParticle: "summer",
      dustSize: 200,
    };

    const lightingData = {
      ctfLighting: { redColor: 16711680, redColorIntensity: 1, blueColor: 26367, blueColorIntensity: 1, attenuationBegin: 100, attenuationEnd: 1000 },
      dominationLighting: { redPointColor: 16711680, redPointIntensity: 1, bluePointColor: 26367, bluePointIntensity: 1, neutralPointColor: 16777215, neutralPointIntensity: 0.7, attenuationBegin: 100, attenuationEnd: 1000 },
    };

    const mapInitData = {
      kick_period_ms: 300000,
      map_id: mapId,
      mapId: ResourceManager.getIdlowById(`maps/${mapId}/xml` as ResourceId),
      invisible_time: 3500,
      spectator: false,
      active: true,
      dustParticle: ResourceManager.getIdlowById("effects/dust"),
      battleId: battle.battleId,
      minRank: settings.minRank,
      maxRank: settings.maxRank,
      skybox: JSON.stringify(skyboxData),
      sound_id: ResourceManager.getIdlowById("sounds/maps/sandbox_ambient"),
      map_graphic_data: JSON.stringify(mapGraphicData),
      reArmorEnabled: settings.reArmorEnabled,
      bonusLightIntensity: 0,
      lighting: JSON.stringify(lightingData),
    };

    client.sendPacket(new InitMapPacket(JSON.stringify(mapInitData)));

    const mapInfo = battleDataObject.maps.find((m) => m.mapId === settings.mapId);
    const timeLeftInSec = settings.timeLimitInSec;

    const battleStatsData = {
      battleMode: settings.battleMode,
      equipmentConstraintsMode: settings.equipmentConstraintsMode,
      fund: 0,
      scoreLimit: settings.scoreLimit,
      timeLimitInSec: timeLeftInSec,
      mapName: mapInfo ? `${mapInfo.mapName} ${BattleMode[settings.battleMode]}` : `${settings.mapId} ${BattleMode[settings.battleMode]}`,
      maxPeopleCount: settings.maxPeopleCount,
      parkourMode: settings.parkourMode,
      premiumBonusInPercent: 100,
      spectator: false,
      suspiciousUserIds: [],
      timeLeft: Math.floor(timeLeftInSec / 256),
      valuableRound: timeLeftInSec % 256 > 128 ? (timeLeftInSec % 256) - 256 : timeLeftInSec % 256,
    };

    client.sendPacket(new BattleStatsPacket(battleStatsData));

    client.sendPacket(new LoadBattleChatPacket());

    if (battle.isTeamMode()) {
      client.sendPacket(new InitBattleTeamPacket());
      const usersBlue = battle.usersBlue.map(this.mapUserToBattleUser);
      const usersRed = battle.usersRed.map(this.mapUserToBattleUser);
      client.sendPacket(new InitBattleUsersTeamPacket(battle.scoreBlue, battle.scoreRed, usersBlue, usersRed));
    } else {
      client.sendPacket(new InitBattleDMPacket());
      const users = battle.users.map(this.mapUserToBattleUser);
      client.sendPacket(new InitBattleUsersDMPacket(users));
    }

    client.sendPacket(new InitializeBattleStatisticsPacket());

    const mineProps = {
      activateSound: ResourceManager.getIdlowById("sounds/mine_activate"),
      activateTimeMsec: 1000,
      battleMines: [],
      blueMineTexture: ResourceManager.getIdlowById("effects/mine/blue_mine_texture"),
      deactivateSound: ResourceManager.getIdlowById("sounds/mine_deactivate"),
      enemyMineTexture: ResourceManager.getIdlowById("effects/mine/enemy_mine_texture"),
      explosionMarkTexture: ResourceManager.getIdlowById("effects/mine/explosion_mark_texture"),
      explosionSound: ResourceManager.getIdlowById("sounds/mine_explosion"),
      farVisibilityRadius: 10,
      friendlyMineTexture: ResourceManager.getIdlowById("effects/mine/friendly_mine_texture"),
      idleExplosionTexture: ResourceManager.getIdlowById("effects/mine/idle_explosion_texture"),
      impactForce: 3,
      mainExplosionTexture: ResourceManager.getIdlowById("effects/mine/main_explosion_texture"),
      minDistanceFromBase: 5,
      model3ds: ResourceManager.getIdlowById("effects/mine/model"),
      nearVisibilityRadius: 7,
      radius: 0.5,
      redMineTexture: ResourceManager.getIdlowById("effects/mine/red_mine_texture"),
    };

    client.sendPacket(new BattleMinesPropertiesPacket(mineProps));

    const withoutSupplies = battle.settings.withoutSupplies;
    const userHasNoSupplies = Array.from(client.user!.supplies.values()).every((count) => count === 0);

    if (!withoutSupplies && !userHasNoSupplies) {
      const userSupplies = client.user!.supplies;
      let availableSupplies = suppliesData;

      if (battle.settings.withoutMines) {
        availableSupplies = availableSupplies.filter((supply) => supply.id !== "mine");
      }

      if (battle.settings.withoutMedkit) {
        availableSupplies = availableSupplies.filter((supply) => supply.id !== "health");
      }

      const consumableItems = availableSupplies.map((supplyInfo) => ({
        id: supplyInfo.id,
        count: userSupplies.get(supplyInfo.id) || 0,
        slotId: supplyInfo.slotId,
        itemEffectTime: supplyInfo.itemEffectTime,
        itemRestSec: supplyInfo.itemRestSec,
      }));

      const consumablesData = {
        items: consumableItems,
      };
      client.sendPacket(new BattleConsumablesPacket(JSON.stringify(consumablesData)));
    }

    const tankModelJson = this._getTankModelDataJson(client, battle);
    client.sendPacket(new TankModelDataPacket(tankModelJson));

    const effectsData = {
      effects: [],
    };
    client.sendPacket(new BattleUserEffectsPacket(JSON.stringify(effectsData)));

    const bonusMarkerResource = ResourceManager.getIdlowById("effects/bonus/drop_location_marker");
    const bonusRegionsPacket = new BonusRegionsPacket({
      bonusRegionResources: [
        { bonusResource: bonusMarkerResource, bonusType: BonusType.GOLD },
        { bonusResource: bonusMarkerResource, bonusType: BonusType.MOON },
        { bonusResource: bonusMarkerResource, bonusType: BonusType.PUMPKIN },
        { bonusResource: bonusMarkerResource, bonusType: BonusType.SPECIAL },
      ],
      bonusRegionData: [],
    });
    client.sendPacket(new BonusRegionsPacket(bonusRegionsPacket));

    const allPlayersInBattle = [...battle.users, ...battle.usersBlue, ...battle.usersRed];

    const usersInfoForPacket: IBattleUserInfo[] = allPlayersInBattle.map((p) => ({
      ChatModeratorLevel: p.chatModeratorLevel,
      deaths: 0,
      kills: 0,
      rank: p.rank,
      score: 0,
      nickname: p.username,
    }));

    const userConnectPacket = new UserConnectDMPacket(client.user!.username, usersInfoForPacket);

    for (const player of allPlayersInBattle) {
      if (player.id === client.user!.id) {
        continue;
      }

      const otherClient = server.findClientByUsername(player.username);
      if (otherClient && otherClient.currentBattle?.battleId === battle.battleId) {
        otherClient.sendPacket(userConnectPacket);
      }
    }

    client.sendPacket(new ConfirmLayoutChange(3, 3));
  }
}
