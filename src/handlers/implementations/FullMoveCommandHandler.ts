import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
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

    const allParticipants = battle.getAllParticipants();

    for (const participant of allParticipants) {
      if (participant.id === client.user.id) {
        continue;
      }

      const otherClient = server.findClientByUsername(participant.username);
      if (otherClient && otherClient.currentBattle?.battleId === battle.battleId) {
        otherClient.sendPacket(fullMovePacket);
      }
    }

    server.battleService.checkPlayerPosition(client);
  }
}