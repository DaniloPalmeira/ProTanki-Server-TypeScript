import { Battle } from "../models/Battle";
import BonusDataPacket from "../packets/implementations/BonusDataPacket";
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

  public static loadMapProps(client: ProTankiClient, server: ProTankiServer, battle: Battle): void {
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
    client.sendPacket(new LoadDependencies(dependencies, CALLBACK.BATTLE_RESOURCES_LOADED));
  }

  public static initializeBattle(client: ProTankiClient, server: ProTankiServer, battle: Battle): void {
    logger.info(`User ${client.user?.username} finished loading all battle resources for ${battle.battleId}.`);
    // O cliente está pronto. Aqui enviaremos os dados finais para iniciar a batalha.
  }
}
