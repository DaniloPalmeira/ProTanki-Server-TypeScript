import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import RotateTurretCommandPacket from "../../packets/implementations/RotateTurretCommandPacket";
import TurretRotationPacket from "../../packets/implementations/TurretRotationPacket";

export default class RotateTurretCommandHandler implements IPacketHandler<RotateTurretCommandPacket> {
  public readonly packetId = RotateTurretCommandPacket.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: RotateTurretCommandPacket): void {
    if (!client.user || !client.currentBattle) {
      return;
    }

    const battle = client.currentBattle;

    const turretRotationPacket = new TurretRotationPacket({
      nickname: client.user.username,
      angle: packet.angle,
      control: packet.control,
    });

    const allPlayers = [...battle.users, ...battle.usersBlue, ...battle.usersRed];

    for (const player of allPlayers) {
      if (player.id === client.user.id) {
        continue;
      }

      const otherClient = server.findClientByUsername(player.username);
      if (otherClient && otherClient.currentBattle?.battleId === battle.battleId) {
        otherClient.sendPacket(turretRotationPacket);
      }
    }
  }
}
