import { CALLBACK } from "../config/constants";
import ConfirmLayoutChange from "../packets/implementations/ConfirmLayoutChange";
import LoadDependencies from "../packets/implementations/LoadDependencies";
import RemoveBattleInfoPacket from "../packets/implementations/RemoveBattleInfoPacket";
import SetLayout from "../packets/implementations/SetLayout";
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

        const resourceIds: ResourceId[] = [];

        const dependencies = {
            resources: ResourceManager.getBulkResources(resourceIds),
        };
        client.sendPacket(new LoadDependencies(dependencies, CALLBACK.GARAGE_DATA));

        logger.info(`User ${client.user.username} is loading garage resources.`);
    }

    public static initializeGarage(client: ProTankiClient, server: ProTankiServer): void {
        logger.info(`Initializing garage for ${client.user?.username}.`);
        client.sendPacket(new ConfirmLayoutChange(1, 1));
    }
}