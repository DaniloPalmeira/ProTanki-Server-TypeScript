import { CALLBACK } from "../config/constants";
import { buildGarageData } from "../config/ItemData";
import ConfirmLayoutChange from "../packets/implementations/ConfirmLayoutChange";
import GarageItemsPacket from "../packets/implementations/GarageItemsPacket";
import LoadDependencies from "../packets/implementations/LoadDependencies";
import MountItemPacket from "../packets/implementations/MountItemPacket";
import RemoveBattleInfoPacket from "../packets/implementations/RemoveBattleInfoPacket";
import SetLayout from "../packets/implementations/SetLayout";
import ShopItemsPacket from "../packets/implementations/ShopItemsPacket";
import { ProTankiClient } from "../server/ProTankiClient";
import { ProTankiServer } from "../server/ProTankiServer";
import { ResourceId } from "../types/resourceTypes";
import logger from "../utils/Logger";
import { ResourceManager } from "../utils/ResourceManager";

export class GarageWorkflow {
  public static async enterGarage(client: ProTankiClient, server: ProTankiServer): Promise<void> {
    if (!client.user) {
      logger.error("Attempted to enter garage without a user authenticated.", { client: client.getRemoteAddress() });
      return;
    }

    client.setState("garage");
    client.sendPacket(new SetLayout(1));
    client.sendPacket(new RemoveBattleInfoPacket());

    const resourceIds: ResourceId[] = [
      "garage",
      "hull/wasp/m0/model",
      "hull/wasp/m0/preview",
      "hull/wasp/m1/model",
      "hull/wasp/m1/preview",
      "hull/wasp/m2/model",
      "hull/wasp/m2/preview",
      "hull/wasp/m3/model",
      "hull/wasp/m3/preview",
      "paint/green/preview",
      "paint/green/texture",
      "paint/holiday/preview",
      "paint/holiday/texture",
      "turret/smoky/m0/model",
      "turret/smoky/m0/preview",
      "turret/smoky/m1/model",
      "turret/smoky/m1/preview",
      "turret/smoky/m2/model",
      "turret/smoky/m2/preview",
      "turret/smoky/m3/model",
      "turret/smoky/m3/preview",
    ];

    const dependencies = {
      resources: ResourceManager.getBulkResources(resourceIds),
    };
    client.sendPacket(new LoadDependencies(dependencies, CALLBACK.GARAGE_DATA));

    logger.info(`User ${client.user.username} is loading garage resources.`);
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

    client.sendPacket(new MountItemPacket("wasp_m3", true));
    client.sendPacket(new MountItemPacket("smoky_m3", true));
    client.sendPacket(new MountItemPacket("green_m0", true));

    client.sendPacket(new ConfirmLayoutChange(1, 1));
  }
}
