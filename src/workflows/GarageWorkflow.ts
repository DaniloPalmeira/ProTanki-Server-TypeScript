import { CALLBACK } from "../config/constants";
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

    const resourceIds: ResourceId[] = ["garage", "hull/wasp/m3/model", "hull/wasp/m3/preview", "paint/green/preview", "paint/green/texture", "paint/holiday/preview", "paint/holiday/texture", "turret/smoky/m3/model", "turret/smoky/m3/preview"];

    const dependencies = {
      resources: ResourceManager.getBulkResources(resourceIds),
    };
    client.sendPacket(new LoadDependencies(dependencies, CALLBACK.GARAGE_DATA));

    logger.info(`User ${client.user.username} is loading garage resources.`);
  }

  public static initializeGarage(client: ProTankiClient, server: ProTankiServer): void {
    logger.info(`Initializing garage for ${client.user?.username}.`);

    const garageItemsData = {
      items: [
        {
          id: "smoky",
          name: "Canhão-fumegante",
          description: "Example",
          isInventory: false,
          index: 100,
          next_price: 166900,
          next_rank: 23,
          type: 1,
          baseItemId: 651066,
          previewResourceId: ResourceManager.getIdlowById("turret/smoky/m3/preview"),
          rank: 23,
          category: "weapon",
          properts: [
            {
              property: "DAMAGE",
              value: null,
              subproperties: [
                { property: "DAMAGE_FROM", value: "44", subproperties: null },
                { property: "DAMAGE_TO", value: "56", subproperties: null },
              ],
            },
            { property: "IMPACT_FORCE", value: "330", subproperties: null },
            { property: "TURRET_TURN_SPEED", value: "122.6", subproperties: null },
            { property: "CRITICAL_HIT_CHANCE", value: "20", subproperties: null },
            { property: "CRITICAL_HIT_DAMAGE", value: "100", subproperties: null },
          ],
          discount: { percent: 0, timeLeftInSeconds: -1751196680, timeToStartInSeconds: -1751196680 },
          grouped: false,
          isForRent: false,
          price: 166900,
          remainingTimeInSec: -1,
          modificationID: 3,
          object3ds: ResourceManager.getIdlowById("turret/smoky/m3/model"),
        },
        {
          id: "wasp",
          name: "Vespa",
          description: "Example",
          isInventory: false,
          index: 700,
          next_price: 172600,
          next_rank: 24,
          type: 2,
          baseItemId: 629496,
          previewResourceId: ResourceManager.getIdlowById("hull/wasp/m3/preview"),
          rank: 24,
          category: "armor",
          properts: [
            { property: "HULL_ARMOR", value: "180", subproperties: null },
            { property: "HULL_SPEED", value: "13.00", subproperties: null },
            { property: "HULL_TURN_SPEED", value: "150", subproperties: null },
            { property: "HULL_MASS", value: "2200", subproperties: null },
            { property: "HULL_POWER", value: null, subproperties: [{ property: "HULL_ACCELERATION", value: "13", subproperties: null }] },
          ],
          discount: { percent: 0, timeLeftInSeconds: -1751196680, timeToStartInSeconds: -1751196680 },
          grouped: false,
          isForRent: false,
          price: 172600,
          remainingTimeInSec: -1,
          modificationID: 3,
          object3ds: ResourceManager.getIdlowById("hull/wasp/m3/model"),
        },
        {
          id: "green",
          name: "Verde",
          description: "Example",
          isInventory: false,
          index: 1100,
          next_price: 0,
          next_rank: 1,
          type: 3,
          baseItemId: ResourceManager.getIdlowById("paint/green/preview"),
          previewResourceId: ResourceManager.getIdlowById("paint/green/preview"),
          rank: 1,
          category: "paint",
          properts: [],
          discount: { percent: 0, timeLeftInSeconds: -1751196680, timeToStartInSeconds: -1751196680 },
          grouped: false,
          isForRent: false,
          price: 0,
          remainingTimeInSec: -1,
          coloring: ResourceManager.getIdlowById("paint/green/texture"),
        },
        {
          id: "holiday",
          name: "Feriado",
          description: "Example",
          isInventory: false,
          index: 1200,
          next_price: 0,
          next_rank: 1,
          type: 3,
          baseItemId: ResourceManager.getIdlowById("paint/holiday/preview"),
          previewResourceId: ResourceManager.getIdlowById("paint/holiday/preview"),
          rank: 1,
          category: "paint",
          properts: [],
          discount: { percent: 0, timeLeftInSeconds: -1751196680, timeToStartInSeconds: -1751196680 },
          grouped: false,
          isForRent: false,
          price: 0,
          remainingTimeInSec: -1,
          coloring: ResourceManager.getIdlowById("paint/holiday/texture"),
        },
      ],
      garageBoxId: ResourceManager.getIdlowById("garage"),
    };

    client.sendPacket(new GarageItemsPacket(JSON.stringify(garageItemsData)));

    client.sendPacket(new MountItemPacket("wasp_m3", true));
    client.sendPacket(new MountItemPacket("smoky_m3", true));
    client.sendPacket(new MountItemPacket("green_m0", true));

    const shopItemsJson = `{
            "items": [],
            "delayMountArmorInSec": 0,
            "delayMountWeaponInSec": 0,
            "delayMountColorInSec": 0
        }`;
    client.sendPacket(new ShopItemsPacket(shopItemsJson));

    client.sendPacket(new ConfirmLayoutChange(1, 1));
  }
}
