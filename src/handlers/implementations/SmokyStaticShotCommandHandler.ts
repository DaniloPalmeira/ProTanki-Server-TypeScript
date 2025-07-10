import SmokyStaticShotCommandPacket from "../../packets/implementations/SmokyStaticShotCommandPacket";
import SmokyStaticShotPacket from "../../packets/implementations/SmokyStaticShotPacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import logger from "../../utils/Logger";
import { IPacketHandler } from "../IPacketHandler";

export default class SmokyStaticShotCommandHandler implements IPacketHandler<SmokyStaticShotCommandPacket> {
  public readonly packetId = SmokyStaticShotCommandPacket.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: SmokyStaticShotCommandPacket): void {
    const { user, currentBattle } = client;

    if (!user || !currentBattle) {
      logger.warn("SmokyStaticShotCommandHandler received packet from client not in battle.", { client: client.getRemoteAddress() });
      return;
    }

    const staticShotPacket = new SmokyStaticShotPacket(user.username, packet.hitPosition);

    const allPlayers = [...currentBattle.users, ...currentBattle.usersBlue, ...currentBattle.usersRed];
    for (const player of allPlayers) {
      if (player.id === user.id) continue;

      const otherClient = server.findClientByUsername(player.username);
      if (otherClient && otherClient.currentBattle?.battleId === currentBattle.battleId) {
        otherClient.sendPacket(staticShotPacket);
      }
    }
  }
}
