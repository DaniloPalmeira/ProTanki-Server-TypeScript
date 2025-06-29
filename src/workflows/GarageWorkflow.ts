import ConfirmLayoutChange from "../packets/implementations/ConfirmLayoutChange";
import SetLayout from "../packets/implementations/SetLayout";
import { ProTankiClient } from "../server/ProTankiClient";
import { ProTankiServer } from "../server/ProTankiServer";
import logger from "../utils/Logger";

export class GarageWorkflow {
  public static async enterGarage(client: ProTankiClient, server: ProTankiServer): Promise<void> {
    if (!client.user) {
      logger.error("Attempted to enter garage without a user authenticated.", { client: client.getRemoteAddress() });
      return;
    }

    client.setState("garage");
    client.sendPacket(new SetLayout(1));
    client.sendPacket(new ConfirmLayoutChange(1, 1));

    logger.info(`User ${client.user.username} entered the garage.`);
  }
}
