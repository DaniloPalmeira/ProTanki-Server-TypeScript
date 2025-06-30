import { Battle } from "../models/Battle";
import LoadDependencies from "../packets/implementations/LoadDependencies";
import SetLayout from "../packets/implementations/SetLayout";
import UnloadBattleListPacket from "../packets/implementations/UnloadBattleListPacket";
import UnloadLobbyChatPacket from "../packets/implementations/UnloadLobbyChatPacket";
import WeaponPhysicsPacket from "../packets/implementations/WeaponPhysicsPacket";
import { ProTankiClient } from "../server/ProTankiClient";
import { ProTankiServer } from "../server/ProTankiServer";
import { CALLBACK } from "../config/constants";
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

    const libraryResourceIds: ResourceId[] = ["library/library1", "library/library2", "library/library3", "library/library4", "library/library5", "library/library6", "library/library7", "library/library8", "library/library9"];

    const dependencies = { resources: ResourceManager.getBulkResources(libraryResourceIds) };
    client.sendPacket(new LoadDependencies(dependencies, CALLBACK.BATTLE_MAP_LIBS_LOADED));
  }

  public static loadMapResources(client: ProTankiClient, server: ProTankiServer, battle: Battle): void {
    logger.info(`User ${client.user?.username} finished loading map libraries for battle ${battle.battleId}.`);
    // O próximo estágio de carregamento (recursos do mapa) será implementado aqui.
  }
}
