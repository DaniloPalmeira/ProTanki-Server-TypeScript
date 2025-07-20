import SmokyStaticShotCommandPacket from "../../packets/implementations/SmokyStaticShotCommandPacket";
import SmokyStaticShotPacket from "../../packets/implementations/SmokyStaticShotPacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import logger from "../../utils/Logger";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";

export default class SmokyStaticShotCommandHandler implements IPacketHandler<SmokyStaticShotCommandPacket> {
  public readonly packetId = SmokyStaticShotCommandPacket.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: SmokyStaticShotCommandPacket): void {
    const { user, currentBattle } = client;

    if (!user || !currentBattle) {
      logger.warn("SmokyStaticShotCommandHandler received packet from client not in battle.", { client: client.getRemoteAddress() });
      return;
    }

    const staticShotPacket = new SmokyStaticShotPacket(user.username, packet.hitPosition);

    const allParticipants = currentBattle.getAllParticipants();
    for (const participant of allParticipants) {
      if (participant.id === user.id) continue;

      const otherClient = server.findClientByUsername(participant.username);
      if (otherClient && otherClient.currentBattle?.battleId === currentBattle.battleId) {
        otherClient.sendPacket(staticShotPacket);
      }
    }
  }
}
