import { IPacketHandler } from "../IPacketHandler";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import logger from "../../utils/Logger";
import ReadyToActivatePacket from "../../packets/implementations/ReadyToActivatePacket";
import ActivateTankPacket from "../../packets/implementations/ActivateTankPacket";

export default class ReadyToActivateHandler implements IPacketHandler<ReadyToActivatePacket> {
  public readonly packetId = ReadyToActivatePacket.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: ReadyToActivatePacket): void {
    if (!client.user || !client.currentBattle) {
      return;
    }

    logger.info(`Activating tank for user ${client.user.username} in battle ${client.currentBattle.battleId}.`);

    client.battleState = "active";

    const battle = client.currentBattle;
    const activationPacket = new ActivateTankPacket(client.user.username);

    const allPlayers = [...battle.users, ...battle.usersBlue, ...battle.usersRed];
    for (const player of allPlayers) {
      const playerClient = server.findClientByUsername(player.username);
      if (playerClient && playerClient.currentBattle?.battleId === battle.battleId) {
        playerClient.sendPacket(activationPacket);
      }
    }
  }
}
