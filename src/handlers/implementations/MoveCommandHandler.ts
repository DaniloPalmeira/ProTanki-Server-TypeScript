import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import MoveCommandPacket from "../../packets/implementations/MoveCommandPacket";
import MovePacket from "../../packets/implementations/MovePacket";

export default class MoveCommandHandler implements IPacketHandler<MoveCommandPacket> {
  public readonly packetId = MoveCommandPacket.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: MoveCommandPacket): void {
    if (!client.user || !client.currentBattle) {
      return;
    }

    client.battlePosition = packet.position;
    client.battleOrientation = packet.orientation;
    client.turretControl = packet.control;

    const battle = client.currentBattle;

    const movePacket = new MovePacket({
      nickname: client.user.username,
      angularVelocity: packet.angularVelocity,
      control: packet.control,
      linearVelocity: packet.linearVelocity,
      orientation: packet.orientation,
      position: packet.position,
    });

    const allPlayers = [...battle.users, ...battle.usersBlue, ...battle.usersRed];

    for (const player of allPlayers) {
      if (player.id === client.user.id) {
        continue;
      }

      const otherClient = server.findClientByUsername(player.username);
      if (otherClient && otherClient.currentBattle?.battleId === battle.battleId) {
        otherClient.sendPacket(movePacket);
      }
    }
  }
}
