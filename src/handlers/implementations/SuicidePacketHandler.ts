import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import SuicidePacket from "../../packets/implementations/SuicidePacket";
import logger from "../../utils/Logger";
import DestroyTankPacket from "../../packets/implementations/DestroyTankPacket";
import { UserDocument } from "../../models/User";

export default class SuicidePacketHandler implements IPacketHandler<SuicidePacket> {
  public readonly packetId = SuicidePacket.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: SuicidePacket): void {
    const { user, currentBattle } = client;

    if (!user || !currentBattle) {
      logger.warn(`SuicidePacket received from client without user or battle.`, {
        client: client.getRemoteAddress(),
      });
      return;
    }

    if (client.battleState === "suicide") {
      logger.warn(`User ${user.username} is already in the process of self-destructing.`);
      return;
    }

    logger.info(`User ${user.username} initiated self-destruct sequence in battle ${currentBattle.battleId}.`);

    const currentIncarnation = client.battleIncarnation;
    client.battleState = "suicide";

    setTimeout(() => {
      if (client.battleIncarnation !== currentIncarnation) {
        logger.info(`Self-destruct for ${user.username} aborted, tank was already destroyed.`);
        return;
      }

      if (!client.currentBattle) {
        logger.info(`Self-destruct for ${user.username} aborted, user left the battle.`);
        return;
      }

      logger.info(`Tank for ${user.username} was destroyed by self-destruct.`);

      const destroyPacket = new DestroyTankPacket(user.username, 3000);

      const allParticipants = currentBattle.getAllParticipants();
      allParticipants.forEach((participant: UserDocument) => {
        const participantClient = server.findClientByUsername(participant.username);
        if (participantClient && participantClient.currentBattle?.battleId === currentBattle.battleId) {
          participantClient.sendPacket(destroyPacket);
        }
      });

      client.battleIncarnation++;
      client.battleState = "suicide";
    }, 10000);
  }
}