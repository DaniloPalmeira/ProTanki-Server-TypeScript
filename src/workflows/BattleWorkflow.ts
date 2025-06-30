import { Battle } from "../models/Battle";
import UnloadBattleListPacket from "../packets/implementations/UnloadBattleListPacket";
import SetLayout from "../packets/implementations/SetLayout";
import UnloadLobbyChatPacket from "../packets/implementations/UnloadLobbyChatPacket";
import { ProTankiClient } from "../server/ProTankiClient";
import { ProTankiServer } from "../server/ProTankiServer";
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
  }
}
