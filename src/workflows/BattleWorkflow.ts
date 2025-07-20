import { Battle, BattleMode, EquipmentConstraintsMode, MapTheme } from "../models/Battle";
import BonusDataPacket from "../packets/implementations/BonusDataPacket";
import InitMapPacket from "../packets/implementations/InitMapPacket";
import LoadDependencies from "../packets/implementations/LoadDependencies";
import SetLayout from "../packets/implementations/SetLayout";
import UnloadBattleListPacket from "../packets/implementations/UnloadBattleListPacket";
import UnloadLobbyChatPacket from "../packets/implementations/UnloadLobbyChatPacket";
import UpdateSpectatorListPacket from "../packets/implementations/UpdateSpectatorListPacket";
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
import { ItemUtils } from "../utils/ItemUtils";
import { sfxBlueprints } from "../config/SfxBlueprints";
import SystemMessage from "../packets/implementations/SystemMessage";
import InitCtfFlagsPacket from "../packets/implementations/InitCtfFlagsPacket";
import { IVector3 } from "../packets/interfaces/geom/IVector3";
import InitDomPointsPacket from "../packets/implementations/InitDomPointsPacket";

export class BattleWorkflow {
  public static async enterBattle(client: ProTankiClient, server: ProTankiServer, battle: Battle): Promise<void> {
    if (!client.user) {
      logger.error("Attempted to enter battle without a user authenticated.", { client: client.getRemoteAddress() });
      return;
    }

    client.isJoiningBattle = true;
    client.setState("battle");
    logger.info(`User ${client.user.username} is entering battle ${battle.battleId}`);

    client.sendPacket(new SetLayout(3));
    client.sendPacket(new UnloadBattleListPacket());
    client.sendPacket(new UnloadLobbyChatPacket());
    client.isChatLoaded = false;
    client.startTimeChecker();
    client.sendPacket(new WeaponPhysicsPacket(JSON.stringify(weaponPhysicsData)));
    client.sendPacket(new BonusDataPacket(JSON.stringify(getBonusData())));

    const mapIdWithoutPrefix = battle.settings.mapId.replace("map_", "");
    const dependencies = { resources: ResourceManager.getMapResources(mapIdWithoutPrefix, MapTheme[battle.settings.mapTheme]) };
    client.sendPacket(new LoadDependencies(dependencies, CALLBACK.BATTLE_MAP_LIBS_LOADED));
  }

  public static loadMapResources(client: ProTankiClient, server: ProTankiServer, battle: Battle): void {
    logger.info(`User ${client.user?.username} is loading skybox for battle ${battle.battleId}.`);
    const mapIdWithoutPrefix = battle.settings.mapId.replace("map_", "");
    const skyboxDependencies = ResourceManager.getSkyboxResources(mapIdWithoutPrefix, battle.settings.mapTheme);
    const dependencies = { resources: skyboxDependencies };
    client.sendPacket(new LoadDependencies(dependencies, CALLBACK.BATTLE_SKYBOX_LOADED));
  }

  public static loadMapGeometry(client: ProTankiClient, server: ProTankiServer, battle: Battle): void {
    logger.info(`User ${client.user?.username} is loading map geometry for battle ${battle.battleId}.`);

    const mapId = battle.settings.mapId.replace("map_", "");
    const themeStr = MapTheme[battle.settings.mapTheme].toLowerCase();
    const mapResourceId = `map/${mapId}/${themeStr}/xml` as ResourceId;

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
      "effects/bonus/drop_location_marker",
      "effects/explosions/fire",
      "effects/explosions/shockwave",
      "effects/explosions/smoke",
      "paint/destroyed/texture",
      "effects/flamethrower/fire_texture",
      "sounds/flamethrower/flame",
      "effects/flamethrower/m0/muzzle_plane_texture",
      "effects/flamethrower/m1/muzzle_plane_texture",
      "effects/flamethrower/m2/muzzle_plane_texture",
      "effects/flamethrower/m3/muzzle_plane_texture",
      "effects/freeze/particle_texture",
      "effects/freeze/plane_texture",
      "sounds/freeze/shot",
      "effects/isida/damaging_ball",
      "effects/isida/damaging_ray",
      "sounds/isida/damaging",
      "effects/isida/healing_ball",
      "effects/isida/healing_ray",
      "sounds/isida/healing",
      "sounds/isida/idle",
      "sounds/machinegun/chain_start",
      "effects/machinegun/crumbs_texture",
      "effects/machinegun/dust_texture",
      "effects/machinegun/fire_across_texture",
      "effects/machinegun/fire_along_texture",
      "sounds/machinegun/hit",
      "sounds/machinegun/long_fail",
      "sounds/machinegun/shoot_end",
      "sounds/machinegun/shoot",
      "effects/machinegun/smoke_texture",
      "effects/machinegun/sparkles_texture",
      "sounds/machinegun/tank_hit",
      "effects/machinegun/tank_sparkles_texture",
      "effects/machinegun/tracer_texture",
      "sounds/machinegun/turbine_start",
      "effects/railgun/charging_part1",
      "effects/railgun/charging_part2",
      "effects/railgun/charging_part3",
      "effects/railgun/hit_mark_texture",
      "effects/railgun/pow_texture",
      "effects/railgun/rings_texture",
      "sounds/railgun/shot",
      "effects/railgun/smoke_image",
      "effects/railgun/sphere_texture",
      "effects/railgun/trail_image",
      "effects/ricochet/bump_flash_texture",
      "effects/ricochet/explosion_texture",
      "sounds/ricochet/explosion",
      "sounds/ricochet/ricochet",
      "effects/ricochet/shot_flash_texture",
      "sounds/ricochet/shot",
      "effects/ricochet/shot_texture",
      "effects/ricochet/tail_trail_texutre",
      "turret/shaft/m0/reticle",
      "turret/shaft/m1/reticle",
      "turret/shaft/m2/reticle",
      "turret/shaft/m3/reticle",
      "sounds/shaft/explosion",
      "effects/shaft/explosion_texture",
      "effects/shaft/hit_mark_texture",
      "effects/shaft/muzzle_flash_texture",
      "sounds/shaft/shot",
      "sounds/shaft/targeting",
      "effects/shaft/trail_texture",
      "sounds/shaft/zoom_mode",
      "sounds/shotgun/magazine_reload",
      "sounds/shotgun/reload",
      "sounds/shotgun/shot",
      "effects/shotgun/explosion_mark_texture0",
      "effects/shotgun/explosion_mark_texture1",
      "effects/shotgun/explosion_mark_texture2",
      "effects/shotgun/explosion_mark_texture3",
      "effects/shotgun/smoke_texture",
      "effects/shotgun/sparkle_texture",
      "effects/shotgun/pellet_trail_texture",
      "effects/shotgun/shot_along_texture",
      "effects/shotgun/shot_across_texture",
      "effects/smoky/critical_hit",
      "effects/smoky/explosion_mark",
      "sounds/smoky/explosion",
      "effects/smoky/explosion/m0",
      "effects/smoky/explosion/m1",
      "effects/smoky/explosion/m2",
      "effects/smoky/explosion/m3",
      "sounds/smoky/shot",
      "effects/smoky/shot",
      "effects/thunder/explosion_mark",
      "sounds/thunder/explosion",
      "effects/thunder/explosion/m0",
      "sounds/thunder/shot",
      "effects/thunder/shot",
      "effects/thunder/explosion/m1",
      "effects/thunder/explosion/m2",
      "effects/thunder/explosion/m3",
      "effects/twins/explosion",
      "effects/twins/hit_mark",
      "effects/twins/muzzle_flash",
      "sounds/twins/shot",
      "effects/twins/shot",
      "flags/blue_flag_sprite",
      "flags/blue_pedestal",
      "flags/red_flag_sprite",
      "flags/red_pedestal",
      "sounds/flags/flag_drop",
      "sounds/flags/flag_return",
      "sounds/flags/flag_take",
      "sounds/flags/win",
      "effects/cp/big_letters",
      "effects/cp/blue_circle",
      "effects/cp/blue_pedestal_texture",
      "effects/cp/blue_ray",
      "effects/cp/blue_ray_tip",
      "effects/cp/neutral_circle",
      "effects/cp/neutral_pedestal_texture",
      "effects/cp/pedestal",
      "effects/cp/red_circle",
      "effects/cp/red_pedestal_texture",
      "effects/cp/red_ray",
      "effects/cp/red_ray_tip",
      "sounds/cp/point_capture_start_negative",
      "sounds/cp/point_capture_start_positive",
      "sounds/cp/point_capture_stop_negative",
      "sounds/cp/point_capture_stop_positive",
      "sounds/cp/point_captured_negative",
      "sounds/cp/point_captured_positive",
      "sounds/cp/point_neutralized_negative",
      "sounds/cp/point_neutralized_positive",
      "sounds/cp/point_score_decreasing",
      "sounds/cp/point_score_increasing",
      "sounds/isida/turret"
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

  public static getTankModelDataJson(client: ProTankiClient, battle: Battle): string {
    const user = client.user!;
    const hullMod = ItemUtils.getItemModification(user, "hull");
    const turretMod = ItemUtils.getItemModification(user, "turret");

    const toRadians = (degrees: number) => degrees * (Math.PI / 180);

    const hullTurnSpeed = ItemUtils.getPropertyValue(hullMod, "HULL_TURN_SPEED") ?? 0;
    const turretTurnSpeed = ItemUtils.getPropertyValue(turretMod, "TURRET_TURN_SPEED") ?? 0;
    const maxArmor = ItemUtils.getHullArmor(user);
    const clientHealth = (client.currentHealth / maxArmor) * 10000;
    const baseImpactForce = ItemUtils.getPropertyValue(turretMod, "IMPACT_FORCE") ?? 0;
    const finalImpactForce = baseImpactForce / 100;

    const team_type = battle.isTeamMode() ? (battle.usersBlue.some((u) => u.id === user.id) ? "BLUE" : "RED") : "NONE";

    const partsObject: { [key: string]: number } = {
      engineIdleSound: ResourceManager.getIdlowById("sounds/hull/engine_idle"),
      engineStartMovingSound: ResourceManager.getIdlowById("sounds/hull/engine_start"),
      engineMovingSound: ResourceManager.getIdlowById("sounds/hull/engine_move"),
    };

    if (user.equippedTurret === "isida") {
      partsObject.turretSound = ResourceManager.getIdlowById("sounds/isida/turret");
    }

    const sfxKey = `${user.equippedTurret}_m${user.turrets.get(user.equippedTurret) ?? 0}`;
    const blueprint = sfxBlueprints[sfxKey];

    if (!blueprint) {
      throw new Error(`SFX blueprint for turret ${sfxKey} not found.`);
    }

    const finalSfxData: { [key: string]: any } = {};
    for (const key in blueprint) {
      const value = blueprint[key];
      if (typeof value === "string") {
        try {
          finalSfxData[key] = ResourceManager.getIdlowById(value as ResourceId);
        } catch (e) {
          throw new Error(`SFX resource ID "${value}" for turret ${sfxKey} could not be resolved.`);
        }
      } else {
        finalSfxData[key] = value;
      }
    }
    console.log({ finalSfxData });

    const isSpawningOrDead = client.battleState === "suicide";

    const data: any = {
      battleId: battle.battleId,
      colormap_id: ResourceManager.getIdlowById(`paint/${user.equippedPaint}/texture` as ResourceId),
      hull_id: `${user.equippedHull}_m${user.hulls.get(user.equippedHull) ?? 0}`,
      turret_id: `${user.equippedTurret}_m${user.turrets.get(user.equippedTurret) ?? 0}`,
      team_type: team_type,
      partsObject: JSON.stringify(partsObject),
      hullResource: ResourceManager.getIdlowById(`hull/${user.equippedHull}/m${user.hulls.get(user.equippedHull) ?? 0}/model` as ResourceId),
      turretResource: ResourceManager.getIdlowById(`turret/${user.equippedTurret}/m${user.turrets.get(user.equippedTurret) ?? 0}/model` as ResourceId),
      sfxData: JSON.stringify(finalSfxData),
      tank_id: user.username,
      nickname: user.username,
      state: client.battleState,
      incarnation: client.battleIncarnation,
      state_null: isSpawningOrDead,
      maxSpeed: ItemUtils.getPropertyValue(hullMod, "HULL_SPEED") ?? 10,
      maxTurnSpeed: toRadians(hullTurnSpeed),
      acceleration: ItemUtils.getPropertyValue(hullMod, "HULL_POWER", "HULL_ACCELERATION") ?? 14,
      reverseAcceleration: 18,
      sideAcceleration: 16,
      turnAcceleration: toRadians(hullTurnSpeed) * 1.15,
      reverseTurnAcceleration: toRadians(hullTurnSpeed) * 2.0,
      mass: ItemUtils.getPropertyValue(hullMod, "HULL_MASS") ?? 2000,
      power: ItemUtils.getPropertyValue(hullMod, "HULL_POWER", "HULL_ACCELERATION") ?? 14,
      dampingCoeff: 1500,
      turret_turn_speed: toRadians(turretTurnSpeed),
      health: isSpawningOrDead ? 0 : clientHealth,
      rank: user.rank,
      kickback: 2.5,
      turretTurnAcceleration: toRadians(turretTurnSpeed) * 1.6,
      impact_force: finalImpactForce,
    };

    if (isSpawningOrDead) {
      data.position = { x: 0, y: 0, z: 0 };
      data.orientation = { x: 0, y: 0, z: 0 };
      data.turretAngle = 0;
      data.turretControl = 0;
    } else {
      data.position = client.battlePosition;
      data.orientation = client.battleOrientation;
      data.turretAngle = client.turretAngle;
      data.turretControl = client.turretControl;
    }

    return JSON.stringify(data);
  }

  public static initializeBattle(client: ProTankiClient, server: ProTankiServer, battle: Battle): void {
    if (client.isSpectator) {
      this._initializeSpectatorBattleView(client, server, battle);
    } else {
      this._initializePlayerBattleView(client, server, battle);
    }
  }

  private static _initializePlayerBattleView(client: ProTankiClient, server: ProTankiServer, battle: Battle) {
    try {
      const user = client.user!;
      logger.info(`User ${user.username} finished loading all battle resources for ${battle.battleId}. Initializing map...`);
      this._sendCommonBattleData(client, server, battle);

      const allOtherClientsInBattle = server.getClients().filter((c) => c.currentBattle?.battleId === battle.battleId && c.user && c.user.id !== user.id);
      const establishedClients = allOtherClientsInBattle.filter((c) => !c.isJoiningBattle);
      const establishedPlayers = establishedClients.filter((c) => !c.isSpectator);

      for (const existingPlayer of establishedPlayers) {
        const existingTankJson = this.getTankModelDataJson(existingPlayer, battle);
        client.sendPacket(new TankModelDataPacket(existingTankJson));
      }

      if (establishedClients.length === 0) {
        logger.info(`Battle has no established players. Spawning ${user.username} immediately.`);
        const joiningUserTankJson = this.getTankModelDataJson(client, battle);
        client.sendPacket(new TankModelDataPacket(joiningUserTankJson));
      } else {
        this._handleConcurrentJoin(client, server, battle, establishedClients);
      }
      this._sendFinalBattlePackets(client, battle);
    } catch (error: any) {
      logger.error(`Error initializing battle for ${client.user?.username}. Disconnecting client.`, { error: error.message });
      client.sendPacket(new SystemMessage("Erro de configuração no seu equipamento. Desconectando."));
      server.battleService.removeUserFromBattle(client.user!, battle);
      setTimeout(() => client.closeConnection(), 500);
    }
  }

  private static _initializeSpectatorBattleView(client: ProTankiClient, server: ProTankiServer, battle: Battle) {
    try {
      const user = client.user!;
      logger.info(`Spectator ${user.username} finished loading resources for ${battle.battleId}. Initializing map view...`);
      this._sendCommonBattleData(client, server, battle);

      const spectatorNames = battle.spectators.map((s) => s.username);
      const spectatorListString = spectatorNames.join("\n");
      client.sendPacket(new UpdateSpectatorListPacket(spectatorListString));

      const allActivePlayers = [...battle.users, ...battle.usersBlue, ...battle.usersRed];
      for (const player of allActivePlayers) {
        const playerClient = server.findClientByUsername(player.username);
        if (playerClient) {
          const playerTankJson = this.getTankModelDataJson(playerClient, battle);
          client.sendPacket(new TankModelDataPacket(playerTankJson));
        }
      }
      this._sendFinalBattlePackets(client, battle);
    } catch (error: any) {
      logger.error(`Error initializing spectator view for ${client.user?.username}.`, { error: error.message });
      client.sendPacket(new SystemMessage("Erro ao entrar como espectador."));
      setTimeout(() => client.closeConnection(), 500);
    }
  }

  private static _sendCommonBattleData(client: ProTankiClient, server: ProTankiServer, battle: Battle): void {
    const settings = battle.settings;
    const mapIdWithPrefix = settings.mapId;
    const mapIdWithoutPrefix = mapIdWithPrefix.replace("map_", "");
    const themeStr = MapTheme[battle.settings.mapTheme].toLowerCase();

    const skyboxResourceIds = ResourceManager.getSkyboxResourceIds(mapIdWithoutPrefix, settings.mapTheme);
    const skyboxData = {
      top: ResourceManager.getIdlowById(skyboxResourceIds[4]),
      front: ResourceManager.getIdlowById(skyboxResourceIds[0]),
      back: ResourceManager.getIdlowById(skyboxResourceIds[1]),
      bottom: ResourceManager.getIdlowById(skyboxResourceIds[5]),
      left: ResourceManager.getIdlowById(skyboxResourceIds[2]),
      right: ResourceManager.getIdlowById(skyboxResourceIds[3]),
    };

    const mapGraphicData = {
      mapId: mapIdWithPrefix,
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
      map_id: mapIdWithPrefix,
      mapId: ResourceManager.getIdlowById(`map/${mapIdWithoutPrefix}/${themeStr}/xml` as ResourceId),
      invisible_time: 3500,
      spectator: client.isSpectator,
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

    let timeLeftInSec = battle.settings.timeLimitInSec;
    if (battle.roundStarted && battle.roundStartTime) {
      const elapsedSeconds = Math.floor((Date.now() - battle.roundStartTime) / 1000);
      timeLeftInSec = Math.max(0, battle.settings.timeLimitInSec - elapsedSeconds);
    }

    const battleStatsData = {
      battleMode: settings.battleMode,
      equipmentConstraintsMode: settings.equipmentConstraintsMode,
      fund: 0,
      scoreLimit: settings.scoreLimit,
      timeLimitInSec: settings.timeLimitInSec,
      mapName: settings.name,
      maxPeopleCount: settings.maxPeopleCount,
      parkourMode: settings.parkourMode,
      premiumBonusInPercent: 100,
      spectator: client.isSpectator,
      suspiciousUserIds: [],
      timeLeft: timeLeftInSec,
    };

    client.sendPacket(new BattleStatsPacket(battleStatsData));
    client.sendPacket(new LoadBattleChatPacket());

    if (battle.settings.battleMode === BattleMode.CTF) {
      const adjustZ = (pos: IVector3 | null): IVector3 | null => {
        if (!pos) return null;
        return { x: pos.x, y: pos.y, z: pos.z + 80 };
      };

      const ctfPacket = new InitCtfFlagsPacket({
        flagBasePositionBlue: adjustZ(battle.flagBasePositionBlue),
        flagCarrierIdBlue: battle.flagCarrierBlue?.username ?? null,
        flagPositionBlue: adjustZ(battle.flagPositionBlue),
        blueFlagSprite: ResourceManager.getIdlowById("flags/blue_flag_sprite"),
        bluePedestalModel: ResourceManager.getIdlowById("flags/blue_pedestal"),
        flagBasePositionRed: adjustZ(battle.flagBasePositionRed),
        flagCarrierIdRed: battle.flagCarrierRed?.username ?? null,
        flagPositionRed: adjustZ(battle.flagPositionRed),
        redFlagSprite: ResourceManager.getIdlowById("flags/red_flag_sprite"),
        redPedestalModel: ResourceManager.getIdlowById("flags/red_pedestal"),
        flagDropSound: ResourceManager.getIdlowById("sounds/flags/flag_drop"),
        flagReturnSound: ResourceManager.getIdlowById("sounds/flags/flag_return"),
        flagTakeSound: ResourceManager.getIdlowById("sounds/flags/flag_take"),
        winSound: ResourceManager.getIdlowById("sounds/flags/win"),
      });
      client.sendPacket(ctfPacket);
    }

    if (battle.settings.battleMode === BattleMode.CP) {
      const domPacket = new InitDomPointsPacket({
        keypointTriggerRadius: 10,
        keypointVisorHeight: 500,
        minesRestrictionRadius: 5,
        points: battle.domPoints.map((p) => ({
          id: p.id,
          name: p.name,
          position: p.position,
          score: p.score,
          scoreChangeRate: 0,
          state: p.state,
          tankIds: p.tanksOnPoint.map((t) => t.username),
        })),
        bigLetters: ResourceManager.getIdlowById("effects/cp/big_letters"),
        blueCircle: ResourceManager.getIdlowById("effects/cp/blue_circle"),
        bluePedestalTexture: ResourceManager.getIdlowById("effects/cp/blue_pedestal_texture"),
        blueRay: ResourceManager.getIdlowById("effects/cp/blue_ray"),
        blueRayTip: ResourceManager.getIdlowById("effects/cp/blue_ray_tip"),
        neutralCircle: ResourceManager.getIdlowById("effects/cp/neutral_circle"),
        neutralPedestalTexture: ResourceManager.getIdlowById("effects/cp/neutral_pedestal_texture"),
        pedestal: ResourceManager.getIdlowById("effects/cp/pedestal"),
        redCircle: ResourceManager.getIdlowById("effects/cp/red_circle"),
        redPedestalTexture: ResourceManager.getIdlowById("effects/cp/red_pedestal_texture"),
        redRay: ResourceManager.getIdlowById("effects/cp/red_ray"),
        redRayTip: ResourceManager.getIdlowById("effects/cp/red_ray_tip"),
        pointCaptureStartNegativeSound: ResourceManager.getIdlowById("sounds/cp/point_capture_start_negative"),
        pointCaptureStartPositiveSound: ResourceManager.getIdlowById("sounds/cp/point_capture_start_positive"),
        pointCaptureStopNegativeSound: ResourceManager.getIdlowById("sounds/cp/point_capture_stop_negative"),
        pointCaptureStopPositiveSound: ResourceManager.getIdlowById("sounds/cp/point_capture_stop_positive"),
        pointCapturedNegativeSound: ResourceManager.getIdlowById("sounds/cp/point_captured_negative"),
        pointCapturedPositiveSound: ResourceManager.getIdlowById("sounds/cp/point_captured_positive"),
        pointNeutralizedNegativeSound: ResourceManager.getIdlowById("sounds/cp/point_neutralized_negative"),
        pointNeutralizedPositiveSound: ResourceManager.getIdlowById("sounds/cp/point_neutralized_positive"),
        pointScoreDecreasingSound: ResourceManager.getIdlowById("sounds/cp/point_score_decreasing"),
        pointScoreIncreasingSound: ResourceManager.getIdlowById("sounds/cp/point_score_increasing"),
      });
      client.sendPacket(domPacket);
    }

    if (battle.isTeamMode()) {
      client.sendPacket(new InitBattleTeamPacket());
      const onlineUsersBlue = battle.usersBlue.filter((u) => server.findClientByUsername(u.username));
      const onlineUsersRed = battle.usersRed.filter((u) => server.findClientByUsername(u.username));
      const usersBlue = onlineUsersBlue.map(this.mapUserToBattleUser);
      const usersRed = onlineUsersRed.map(this.mapUserToBattleUser);
      client.sendPacket(new InitBattleUsersTeamPacket(battle.scoreBlue, battle.scoreRed, usersBlue, usersRed));
    } else {
      client.sendPacket(new InitBattleDMPacket());
      const onlineUsers = battle.users.filter((u) => server.findClientByUsername(u.username));
      const users = onlineUsers.map(this.mapUserToBattleUser);
      client.sendPacket(new InitBattleUsersDMPacket(users));
    }

    client.sendPacket(new InitializeBattleStatisticsPacket());
  }

  private static _handleConcurrentJoin(client: ProTankiClient, server: ProTankiServer, battle: Battle, establishedClients: ProTankiClient[]): void {
    const user = client.user!;
    logger.info(`Waiting for ${establishedClients.length} established players to load resources for ${user.username}.`);
    client.pendingResourceAcks = new Set(establishedClients.map((p) => p.user!.username));
    let spawnTriggered = false;

    const triggerSpawn = (timedOut: boolean) => {
      if (spawnTriggered) return;
      spawnTriggered = true;

      clearTimeout(spawnTimeout);
      server.removeDynamicCallback(callbackId);

      if (timedOut) {
        logger.warn(`Spawning ${user.username} after timeout. The following players did not acknowledge:`, [...client.pendingResourceAcks]);
      } else {
        logger.info(`All established players loaded resources for ${user.username}. Spawning tank.`);
      }

      const joiningUserTankJson = this.getTankModelDataJson(client, battle);
      const joiningUserTankPacket = new TankModelDataPacket(joiningUserTankJson);

      const allCurrentPlayersInBattle = server.getClients().filter((c) => c.currentBattle?.battleId === battle.battleId);
      for (const playerClient of allCurrentPlayersInBattle) {
        playerClient.sendPacket(joiningUserTankPacket);
      }
    };

    const spawnTimeout = setTimeout(() => triggerSpawn(true), 10000);

    const onResourcesLoadedCallback = (acknowledgingClient: ProTankiClient) => {
      if (spawnTriggered) return;

      const ackUsername = acknowledgingClient.user!.username;
      logger.info(`${ackUsername} has loaded resources for ${user.username}.`);

      if (client.pendingResourceAcks.has(ackUsername)) {
        client.pendingResourceAcks.delete(ackUsername);
      }

      if (client.pendingResourceAcks.size === 0) {
        triggerSpawn(false);
      }
    };

    var callbackId = server.registerDynamicCallback(onResourcesLoadedCallback);

    const hullId = user.equippedHull,
      hullMod = user.hulls.get(hullId) ?? 0;
    const turretId = user.equippedTurret,
      turretMod = user.turrets.get(turretId) ?? 0;
    const paintId = user.equippedPaint;
    const resourcesToLoad: ResourceId[] = [`turret/${turretId}/m${turretMod}/model` as ResourceId, `hull/${hullId}/m${hullMod}/model` as ResourceId, `paint/${paintId}/texture` as ResourceId];
    const depsPacket = new LoadDependencies({ resources: ResourceManager.getBulkResources(resourcesToLoad) }, callbackId);

    const allPlayersInBattleForConnectPacket = [...battle.users, ...battle.usersBlue, ...battle.usersRed];
    const usersInfoForPacket: IBattleUserInfo[] = allPlayersInBattleForConnectPacket.map((p) => ({
      ChatModeratorLevel: p.chatModeratorLevel,
      deaths: 0,
      kills: 0,
      rank: p.rank,
      score: 0,
      nickname: p.username,
    }));
    const userConnectPacket = new UserConnectDMPacket(user.username, usersInfoForPacket);

    for (const existingClient of establishedClients) {
      existingClient.sendPacket(depsPacket);
      existingClient.sendPacket(userConnectPacket);
    }
  }

  private static _sendFinalBattlePackets(client: ProTankiClient, battle: Battle): void {
    const user = client.user!;

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
    const userHasNoSupplies = Array.from(user.supplies.values()).every((count) => count === 0);

    if (!withoutSupplies && !userHasNoSupplies && !client.isSpectator) {
      const userSupplies = user.supplies;
      let availableSupplies = suppliesData;
      if (battle.settings.withoutMines) availableSupplies = availableSupplies.filter((s) => s.id !== "mine");
      if (battle.settings.withoutMedkit) availableSupplies = availableSupplies.filter((s) => s.id !== "health");
      const consumableItems = availableSupplies.map((si) => ({ id: si.id, count: userSupplies.get(si.id) || 0, slotId: si.slotId, itemEffectTime: si.itemEffectTime, itemRestSec: si.itemRestSec }));
      client.sendPacket(new BattleConsumablesPacket(JSON.stringify({ items: consumableItems })));
    }

    const effectsData = { effects: [] };
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
    client.sendPacket(bonusRegionsPacket);
    client.sendPacket(new ConfirmLayoutChange(3, 3));
    client.isJoiningBattle = false;
  }
}