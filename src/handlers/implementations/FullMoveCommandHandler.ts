import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import FullMoveCommandPacket from "../../packets/implementations/FullMoveCommandPacket";
import FullMovePacket from "../../packets/implementations/FullMovePacket";

export default class FullMoveCommandHandler implements IPacketHandler<FullMoveCommandPacket> {
  public readonly packetId = FullMoveCommandPacket.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: FullMoveCommandPacket): void {
    if (!client.user || !client.currentBattle) {
      return;
    }

    client.battlePosition = packet.position;
    client.battleOrientation = packet.orientation;
    client.turretControl = packet.control;

    const battle = client.currentBattle;

    const fullMovePacket = new FullMovePacket({
      nickname: client.user.username,
      angularVelocity: packet.angularVelocity,
      control: packet.control,
      linearVelocity: packet.linearVelocity,
      orientation: packet.orientation,
      position: packet.position,
      direction: packet.direction,
    });

    const allPlayers = [...battle.users, ...battle.usersBlue, ...battle.usersRed];

    for (const player of allPlayers) {
      if (player.id === client.user.id) {
        continue;
      }

      const otherClient = server.findClientByUsername(player.username);
      if (otherClient && otherClient.currentBattle?.battleId === battle.battleId) {
        otherClient.sendPacket(fullMovePacket);
      }
    }
  }
}
