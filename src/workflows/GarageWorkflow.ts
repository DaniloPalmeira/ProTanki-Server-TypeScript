import { CALLBACK } from "../config/constants";
import { buildGarageData, itemBlueprints } from "../config/ItemData";
import ConfirmLayoutChange from "../packets/implementations/ConfirmLayoutChange";
import ConfirmDestructionPacket from "../packets/implementations/ConfirmDestructionPacket";
import GarageItemsPacket from "../packets/implementations/GarageItemsPacket";
import LoadDependencies from "../packets/implementations/LoadDependencies";
import MountItemPacket from "../packets/implementations/MountItemPacket";
import SelfDestructScheduledPacket from "../packets/implementations/SelfDestructScheduledPacket";
import SetLayout from "../packets/implementations/SetLayout";
import ShopItemsPacket from "../packets/implementations/ShopItemsPacket";
import UnloadBattleListPacket from "../packets/implementations/UnloadBattleListPacket";
import UnloadGaragePacket from "../packets/implementations/UnloadGaragePacket";
import { ProTankiClient } from "../server/ProTankiClient";
import { ProTankiServer } from "../server/ProTankiServer";
import { ResourceId } from "../types/resourceTypes";
import logger from "../utils/Logger";
import { ResourceManager } from "../utils/ResourceManager";
import { LobbyWorkflow } from "./LobbyWorkflow";

export class GarageWorkflow {
  private static _loadGarageDependencies(client: ProTankiClient): void {
    const resourceIds: ResourceId[] = ["garage"];

    itemBlueprints.turrets.forEach((turret) => {
      turret.modifications.forEach((mod) => {
        resourceIds.push(`turret/${turret.id}/m${mod.modificationID}/model` as ResourceId);
        resourceIds.push(`turret/${turret.id}/m${mod.modificationID}/preview` as ResourceId);
      });
    });

    itemBlueprints.hulls.forEach((hull) => {
      hull.modifications.forEach((mod) => {
        resourceIds.push(`hull/${hull.id}/m${mod.modificationID}/model` as ResourceId);
        resourceIds.push(`hull/${hull.id}/m${mod.modificationID}/preview` as ResourceId);
      });
    });

    itemBlueprints.paints.forEach((paint) => {
      resourceIds.push(`paint/${paint.id}/texture` as ResourceId);
      resourceIds.push(`paint/${paint.id}/preview` as ResourceId);
    });

    const uniqueResourceIds = [...new Set(resourceIds)];

    const dependencies = {
      resources: ResourceManager.getBulkResources(uniqueResourceIds),
    };
    client.sendPacket(new LoadDependencies(dependencies, CALLBACK.GARAGE_DATA));

    logger.info(`User ${client.user!.username} is loading garage resources.`);
  }

  public static async enterGarage(client: ProTankiClient, server: ProTankiServer): Promise<void> {
    if (!client.user) {
      logger.error("Attempted to enter garage without a user authenticated.", { client: client.getRemoteAddress() });
      return;
    }

    if (!client.isChatLoaded) {
      await LobbyWorkflow.sendChatSetup(client.user, client, server);
    }

    client.setState("chat_garage");
    client.sendPacket(new SetLayout(1));
    client.sendPacket(new UnloadBattleListPacket());

    this._loadGarageDependencies(client);
  }

  public static enterBattleGarageView(client: ProTankiClient, server: ProTankiServer): void {
    client.setState("battle_garage");
    client.sendPacket(new SetLayout(1));
    this._loadGarageDependencies(client);
  }

  public static transitionFromLobbyToGarage(client: ProTankiClient, server: ProTankiServer): void {
    client.sendPacket(new UnloadBattleListPacket());
    this.enterBattleGarageView(client, server);
  }

  public static returnToBattleView(client: ProTankiClient, server: ProTankiServer): void {
    client.setState("battle");
    client.sendPacket(new SetLayout(3));
    client.sendPacket(new UnloadGaragePacket());

    if (client.equipmentChangedInGarage) {
      client.equipmentChangedInGarage = false;
      client.pendingEquipmentRespawn = true;

      if (client.battleState !== "suicide") {
        const selfDestructTime = 3000;
        client.sendPacket(new SelfDestructScheduledPacket(selfDestructTime));

        setTimeout(() => {
          if (client.isDestroyed || !client.currentBattle) {
            return;
          }

          if (client.battleState === "suicide") {
            return;
          }

          client.battleState = "suicide";
          client.battleIncarnation++;

          const destructionPacket = new ConfirmDestructionPacket(client.user!.username, 3000);
          const battle = client.currentBattle;
          const allPlayers = [...battle.users, ...battle.usersBlue, ...battle.usersRed];
          allPlayers.forEach((player) => {
            const playerClient = server.findClientByUsername(player.username);
            if (playerClient && playerClient.currentBattle?.battleId === battle.battleId) {
              playerClient.sendPacket(destructionPacket);
            }
          });
        }, selfDestructTime);
      }
    }

    client.sendPacket(new ConfirmLayoutChange(3, 3));
  }

  public static initializeGarage(client: ProTankiClient, server: ProTankiServer): void {
    if (!client.user) {
      logger.error(`Cannot initialize garage for unauthenticated client.`);
      return;
    }

    logger.info(`Initializing garage for ${client.user.username}.`);

    const userInventory = {
      ...Object.fromEntries(client.user.turrets),
      ...Object.fromEntries(client.user.hulls),
      paints: client.user.paints,
    };

    const { garageItems, shopItems } = buildGarageData(userInventory);

    const garageData = {
      items: garageItems,
      garageBoxId: ResourceManager.getIdlowById("garage"),
    };
    client.sendPacket(new GarageItemsPacket(JSON.stringify(garageData)));

    const shopData = {
      items: shopItems,
      delayMountArmorInSec: 0,
      delayMountWeaponInSec: 0,
      delayMountColorInSec: 0,
    };
    client.sendPacket(new ShopItemsPacket(JSON.stringify(shopData)));

    const turretId = client.user.equippedTurret;
    const turretMod = client.user.turrets.get(turretId) ?? 0;
    const hullId = client.user.equippedHull;
    const hullMod = client.user.hulls.get(hullId) ?? 0;
    const paintId = client.user.equippedPaint;

    client.sendPacket(new MountItemPacket(`${hullId}_m${hullMod}`, true));
    client.sendPacket(new MountItemPacket(`${turretId}_m${turretMod}`, true));
    client.sendPacket(new MountItemPacket(`${paintId}_m0`, true));

    if (client.getState() === "battle_garage") {
      client.sendPacket(new ConfirmLayoutChange(3, 1));
    } else {
      client.sendPacket(new ConfirmLayoutChange(1, 1));
    }
  }
}
