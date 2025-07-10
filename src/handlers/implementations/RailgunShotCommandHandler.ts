import RailgunShotPacket from "../../packets/implementations/RailgunShotPacket";
import RailgunShotCommandPacket from "../../packets/implementations/RailgunShotCommandPacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import logger from "../../utils/Logger";

export default class RailgunShotCommandHandler implements IPacketHandler<RailgunShotCommandPacket> {
  public readonly packetId = RailgunShotCommandPacket.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: RailgunShotCommandPacket): void {
    const { user, currentBattle } = client;

    if (!user || !currentBattle) {
      logger.warn("RailgunShotCommandHandler received a packet from a client not in a battle.", { client: client.getRemoteAddress() });
      return;
    }

    const shotPacket = new RailgunShotPacket({
      shooterNickname: user.username,
      hitPosition: packet.position,
      targets: packet.targets.map((target) => ({
        nickname: target.nickname,
        position: target.position,
      })),
    });

    const allPlayers = [...currentBattle.users, ...currentBattle.usersBlue, ...currentBattle.usersRed];

    for (const player of allPlayers) {
      if (player.id === user.id) {
        continue;
      }

      const otherClient = server.findClientByUsername(player.username);
      if (otherClient && otherClient.currentBattle?.battleId === currentBattle.battleId) {
        otherClient.sendPacket(shotPacket);
      }
    }

    logger.info(`User ${user.username} fired a railgun shot in battle ${currentBattle.battleId}`, { targets: packet.targets.map((t) => t.nickname) });
  }
}
