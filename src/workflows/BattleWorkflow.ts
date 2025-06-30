import { Battle } from "../models/Battle";
import RemoveBattleInfoPacket from "../packets/implementations/RemoveBattleInfoPacket";
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
    client.sendPacket(new RemoveBattleInfoPacket());
    client.sendPacket(new UnloadLobbyChatPacket());
  }
}
