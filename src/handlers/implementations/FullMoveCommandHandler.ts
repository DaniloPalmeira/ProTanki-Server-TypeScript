import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import FullMoveCommandPacket from "../../packets/implementations/FullMoveCommandPacket";
import MovePacket from "../../packets/implementations/MovePacket";

export default class FullMoveCommandHandler implements IPacketHandler<FullMoveCommandPacket> {
  public readonly packetId = FullMoveCommandPacket.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: FullMoveCommandPacket): void {
    if (!client.user || !client.currentBattle) {
      return;
    }

    const battle = client.currentBattle;

    // const movePacket = new MovePacket({
    //   nickname: client.user.username,
    //   incarnation: packet.incarnation,
    //   angularVelocity: packet.angularVelocity,
    //   control: packet.control,
    //   linearVelocity: packet.linearVelocity,
    //   orientation: packet.orientation,
    //   position: packet.position,
    // });

    // const allPlayers = [...battle.users, ...battle.usersBlue, ...battle.usersRed];

    // for (const player of allPlayers) {
    //   if (player.id === client.user.id) {
    //     continue;
    //   }

    //   const otherClient = server.findClientByUsername(player.username);
    //   if (otherClient && otherClient.currentBattle?.battleId === battle.battleId) {
    //     otherClient.sendPacket(movePacket);
    //   }
    // }
  }
}
