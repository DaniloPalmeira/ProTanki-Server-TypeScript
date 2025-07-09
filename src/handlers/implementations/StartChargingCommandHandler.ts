import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import StartChargingCommandPacket from "../../packets/implementations/StartChargingCommandPacket";
import StartChargingPacket from "../../packets/implementations/StartChargingPacket";

export default class StartChargingCommandHandler implements IPacketHandler<StartChargingCommandPacket> {
  public readonly packetId = StartChargingCommandPacket.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: StartChargingCommandPacket): void {
    const { user, currentBattle } = client;

    if (!user || !currentBattle) {
      return;
    }

    const startChargingPacket = new StartChargingPacket({
      nickname: user.username,
    });

    const allPlayers = [...currentBattle.users, ...currentBattle.usersBlue, ...currentBattle.usersRed];

    for (const player of allPlayers) {
      if (player.id === user.id) {
        continue;
      }

      const otherClient = server.findClientByUsername(player.username);
      if (otherClient && otherClient.currentBattle?.battleId === currentBattle.battleId) {
        otherClient.sendPacket(startChargingPacket);
      }
    }
  }
}
