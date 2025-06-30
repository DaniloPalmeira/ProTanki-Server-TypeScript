import { Battle, MapTheme } from "../models/Battle";
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
import { BattleMode } from "../models/Battle";

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
    client.sendPacket(new WeaponPhysicsPacket(JSON.stringify(weaponPhysicsData)));
    client.sendPacket(new BonusDataPacket(JSON.stringify(getBonusData())));

    const libraryResourceIds: ResourceId[] = ["library/library1", "library/library2", "library/library3", "library/library4", "library/library5", "library/library6", "library/library7", "library/library8", "library/library9"];

    const dependencies = { resources: ResourceManager.getBulkResources(libraryResourceIds) };
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

    const generalResources: ResourceId[] = ["sounds/maps/sandbox_ambient", "effects/dust"];

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
      lighting: '{"ctfLighting":{"redColor":16711680,"redColorIntensity":1,"blueColor":26367,"blueColorIntensity":1,"attenuationBegin":100,"attenuationEnd":1000},"dominationLighting":{"redPointColor":16711680,"redPointIntensity":1,"bluePointColor":26367,"bluePointIntensity":1,"neutralPointColor":16777215,"neutralPointIntensity":0.7,"attenuationBegin":100,"attenuationEnd":1000}}',
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
  }
}
